<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGameRole extends Model
{
    use HasFactory;
    protected $table = 'user_game_role';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'user',
        'game',
        'role'
    ];
}
