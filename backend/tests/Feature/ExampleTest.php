<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     * Test de health check para verificar que la aplicacion esta funcionando.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        // Usamos la ruta /up que es el health check de Laravel
        $response = $this->get('/up');

        $response->assertStatus(200);
    }
}
