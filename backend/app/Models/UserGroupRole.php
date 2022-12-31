<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserGroupRole extends Model
{
    use HasFactory;
    protected $table = 'user_group_role';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'user',
        'group',
        'role'
    ];
}
