<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\TeamMemberSeeder; // Import the TeamMemberSeeder

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run TeamMemberSeeder to create 5 team members
        $this->call(TeamMemberSeeder::class);
    }
}
