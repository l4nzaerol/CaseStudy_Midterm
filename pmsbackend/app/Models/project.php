<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name','description','start_date','end_date','status','user_id'
    ];

    // A project “belongsToMany” users (team members) via pivot table project_user
    public function users()
    {
        return $this->belongsToMany(User::class, 'project_user');
    }

    // A project “hasMany” tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
