<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        if (! $request->user()?->isOwner()) {
            abort(403, 'Hanya Owner yang dapat mengakses manajemen pengguna.');
        }

        $search = $request->input('search', '');
        $role = $request->input('role', '');

        $users = User::when($search, fn ($q) => $q->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%");
        }))
            ->when($role, fn ($q) => $q->where('role', $role))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        if ($request->hasFile('photo')) {
            $data['avatar_path'] = $request->file('photo')->store('profile', 'public');
        }

        unset($data['photo'], $data['remove_photo']);

        User::create($data);

        return redirect()->route('users.index')
            ->with('success', 'Pengguna baru berhasil ditambahkan.');
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        // User tidak boleh mengubah role akunnya sendiri
        if ($user->id === Auth::id() && isset($data['role']) && $data['role'] !== $user->role) {
            return redirect()->back()->with('error', 'Anda tidak dapat mengubah role akun Anda sendiri.');
        }

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Prevent last owner from being demoted
        if ($user->role === 'owner' && $data['role'] !== 'owner') {
            $otherOwners = User::where('role', 'owner')->where('id', '!=', $user->id)->count();
            if ($otherOwners === 0) {
                return redirect()->back()->with('error', 'Tidak dapat mengubah role karena sistem harus memiliki minimal 1 Owner.');
            }
        }

        if ($request->boolean('remove_photo')) {
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $data['avatar_path'] = null;
        } elseif ($request->hasFile('photo')) {
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $data['avatar_path'] = $request->file('photo')->store('profile', 'public');
        }

        unset($data['photo'], $data['remove_photo']);

        $user->update($data);

        return redirect()->route('users.index')
            ->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if (! Auth::user()?->isOwner()) {
            abort(403, 'Hanya Owner yang dapat menghapus pengguna.');
        }

        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->role === 'owner') {
            $otherOwners = User::where('role', 'owner')->where('id', '!=', $user->id)->count();
            if ($otherOwners === 0) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus Owner terakhir.');
            }
        }

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Pengguna berhasil dihapus.');
    }
}
