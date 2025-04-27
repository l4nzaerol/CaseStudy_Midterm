<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; // Assuming you are using the User model
use Illuminate\Support\Facades\Hash;

class TeamMemberSeeder extends Seeder
{
    public function run()
    {
        // Array of different team member names
        $teamMembers = [
            'Lanz Aerol Ardenio',
            'Regie Shaine Asi',
            'Aeron Bagunu',
            'Crystal Barayang',
            'Calvin Batiao',
        ];

        // Create 5 users with different names and assign the 'team_member' role to each
        foreach ($teamMembers as $name) {
            $user = User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com', // Generate email from name
                'password' => Hash::make('password'), // Default password (hashed)
                'role' => 'team_member',
            ]);
        }
    }
}
