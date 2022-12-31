<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageUser extends Model
{
    use HasFactory;
    protected $table = 'message_user';
    protected $primaryKey = 'id';
    public $timestamps = false;
    protected $fillable = [
        'sender',
        'receiver',
        'message',
        'isImage'
    ];
}
