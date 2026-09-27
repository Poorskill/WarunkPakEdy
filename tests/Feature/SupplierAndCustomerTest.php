<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierAndCustomerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->user = User::where('role', 'owner')->first();
    }

    public function test_supplier_list_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/suppliers');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('suppliers/index'));
    }

    public function test_supplier_can_be_created(): void
    {
        $response = $this->actingAs($this->user)->post('/suppliers', [
            'name' => 'PT Pemasok Baru',
            'phone' => '081234567890',
            'email' => 'pemasok@mail.com',
            'address' => 'Jl. Industri No. 10',
            'notes' => 'Pemasok minuman',
            'is_active' => true,
        ]);

        $response->assertRedirect('/suppliers');
        $this->assertDatabaseHas('suppliers', ['name' => 'PT Pemasok Baru']);
    }

    public function test_supplier_can_be_updated(): void
    {
        $supplier = Supplier::first();

        $response = $this->actingAs($this->user)->put("/suppliers/{$supplier->id}", [
            'name' => 'Nama Supplier Diperbarui',
            'phone' => '089988776655',
            'email' => 'update@supplier.com',
            'address' => 'Alamat baru',
            'notes' => 'Catatan diperbarui',
            'is_active' => true,
        ]);

        $response->assertRedirect('/suppliers');
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Nama Supplier Diperbarui',
        ]);
    }

    public function test_supplier_can_be_deleted(): void
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Khusus Hapus',
            'phone' => '0800000000',
        ]);

        $response = $this->actingAs($this->user)->delete("/suppliers/{$supplier->id}");
        $response->assertRedirect('/suppliers');

        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    public function test_customer_list_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/customers');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('customers/index'));
    }

    public function test_customer_can_be_created(): void
    {
        $response = $this->actingAs($this->user)->post('/customers', [
            'name' => 'Pelanggan Baru Setia',
            'phone' => '081399887766',
            'email' => 'pelanggan@mail.com',
            'address' => 'Komplek Griya Indah Blok A1',
            'notes' => 'Suka beli beras',
        ]);

        $response->assertRedirect('/customers');
        $this->assertDatabaseHas('customers', ['name' => 'Pelanggan Baru Setia']);
    }

    public function test_customer_can_be_updated(): void
    {
        $customer = Customer::first();

        $response = $this->actingAs($this->user)->put("/customers/{$customer->id}", [
            'name' => 'Nama Pelanggan Diperbarui',
            'phone' => '081122334455',
            'email' => 'updated.cust@mail.com',
            'address' => 'Alamat rumah baru',
            'notes' => 'Langganan tetap',
        ]);

        $response->assertRedirect('/customers');
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Nama Pelanggan Diperbarui',
        ]);
    }

    public function test_customer_can_be_deleted(): void
    {
        $customer = Customer::create([
            'name' => 'Pelanggan Khusus Hapus',
            'phone' => '0877777777',
        ]);

        $response = $this->actingAs($this->user)->delete("/customers/{$customer->id}");
        $response->assertRedirect('/customers');

        $this->assertSoftDeleted('customers', ['id' => $customer->id]);
    }

    public function test_customer_point_history_can_be_retrieved(): void
    {
        $customer = Customer::first();
        $response = $this->actingAs($this->user)->get("/customers/{$customer->id}/point-history");
        $response->assertOk();
        $response->assertJsonStructure([
            'customer' => ['id', 'name', 'loyalty_points'],
            'histories',
        ]);
    }
}
