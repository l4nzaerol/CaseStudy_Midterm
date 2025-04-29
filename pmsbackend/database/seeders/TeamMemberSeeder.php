<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; // Assuming you are using the User model
use Illuminate\Support\Facades\Hash;

class TeamMemberSeeder extends Seeder
{
    public function run()
    {
        // Seed 5 team members
        $teamMembers = [
            'Lanz Aerol Ardenio',
            'Regie Shaine Asi',
            'Aeron Bagunu',
            'Crystal Barayang',
            'Calvin Batiao',
        ];

        foreach ($teamMembers as $name) {
            User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
                'password' => Hash::make('password'),
                'role' => 'team_member',
            ]);
        }

        // Seed 1 project manager
        User::create([
            'name' => 'Project Manager',
            'email' => 'klickadmin@gmail.com',
            'password' => Hash::make('password'), // Default password
            'role' => 'project_manager',
        ]);
    }
}
