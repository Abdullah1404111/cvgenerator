<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'google_id','name', 'email', 'password', 'linkedin_id'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Relationships
    public function cv() {
      return $this->hasOne(Cv::class);
    }

    public function projects() {
      return $this->hasMany(Project::class);
    }

    public function educations() {
      return $this->hasMany(Education::class);
    }

    public function skills() {
      return $this->hasMany(Skill::class);
    }

    public function queries() {
      return $this->hasMany(Query::class);
    }

    public function sociallogin() {
      return $this->hasOne(SocialLogin::class);
    }

    public function auctions() {
      return $this->hasMany(Auction::class);
    }

    public function bidders() {
      return $this->hasMany(Bidder::class);
    }

}
