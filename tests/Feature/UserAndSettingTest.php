<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserAndSettingTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;

    protected User $cashier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->owner = User::where('role', 'owner')->first();
        $this->cashier = User::where('role', 'cashier')->first();
    }

    public function test_owner_can_view_users_list(): void
    {
        $response = $this->actingAs($this->owner)->get('/users');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('users/index')
            ->has('users')
        );
    }

    public function test_owner_can_create_new_user(): void
    {
        $response = $this->actingAs($this->owner)->post('/users', [
            'name' => 'Karyawan Baru',
            'email' => 'karyawan@warunkpakedy.test',
            'password' => 'secret123',
            'role' => 'cashier',
        ]);

        $response->assertRedirect('/users');
        $this->assertDatabaseHas('users', [
            'name' => 'Karyawan Baru',
            'email' => 'karyawan@warunkpakedy.test',
            'role' => 'cashier',
        ]);
    }

    public function test_owner_can_update_user_and_change_role(): void
    {
        $user = User::where('role', 'cashier')->first();

        $response = $this->actingAs($this->owner)->put("/users/{$user->id}", [
            'name' => 'Budi Promoted',
            'email' => $user->email,
            'role' => 'admin',
        ]);

        $response->assertRedirect('/users');
        $user->refresh();
        $this->assertEquals('Budi Promoted', $user->name);
        $this->assertEquals('admin', $user->role);
    }

    public function test_user_cannot_delete_themselves(): void
    {
        $response = $this->actingAs($this->owner)->delete("/users/{$this->owner->id}");
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $this->owner->id]);
    }

    public function test_cashier_is_forbidden_from_users_management_and_settings(): void
    {
        $usersResponse = $this->actingAs($this->cashier)->get('/users');
        $usersResponse->assertStatus(403);

        $settingsResponse = $this->actingAs($this->cashier)->get('/settings/store');
        $settingsResponse->assertStatus(403);
    }

    public function test_owner_can_view_and_update_store_settings(): void
    {
        $viewResponse = $this->actingAs($this->owner)->get('/settings/store');
        $viewResponse->assertStatus(200);
        $viewResponse->assertInertia(fn ($page) => $page
            ->component('settings/store')
            ->has('settings')
        );

        $updateResponse = $this->actingAs($this->owner)->put('/settings/store', [
            'store_name' => 'Warunk Modern Pak Edy',
            'store_phone' => '0899-1122-3344',
            'store_address' => 'Jl. Baru No. 99, Surabaya',
            'receipt_footer' => 'Matur nuwun sanget sampun rawuh!',
        ]);

        $updateResponse->assertRedirect();
        $this->assertEquals('Warunk Modern Pak Edy', Setting::get('store_name'));
        $this->assertEquals('0899-1122-3344', Setting::get('store_phone'));
        $this->assertEquals('Jl. Baru No. 99, Surabaya', Setting::get('store_address'));
        $this->assertEquals('Matur nuwun sanget sampun rawuh!', Setting::get('receipt_footer'));
    }
}
