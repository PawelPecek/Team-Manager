<?php

use App\Models\Game;
use App\Models\User;
use App\Models\Group;
use App\Models\MessageUser;
use App\Models\MessageGroup;
use App\Models\UserGameRole;
use Illuminate\Http\Request;
use App\Models\UserGroupRole;
use Illuminate\Support\Facades\Route;
use Intervention\Image\Facades\Image;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
*/

function logOut($text){
    $out = new \Symfony\Component\Console\Output\ConsoleOutput();
    $out->writeln($text);
}

function datetimeCheck ($val, $format = 'Y-m-d H:i:s') {
    $d = DateTime::createFromFormat($format, $val);
    return (integer)($d && $d->format($format) == $val);
}

Route::post('/user/create', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (strlen($request->input('login')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Login must be longer than 5 chars"]);
    }
    if (strlen($request->input('login')) > 50) {
        return json_encode(["status"=>"error", "description"=>"Login must be shorter than 50 chars"]);
    }
    if (User::where('login', $request->input('login'))->count() > 0) {
        return json_encode(["status"=>"error", "description"=>"Login is already taken"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    if (strlen($request->input('password')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Password must be longer than 5 chars"]);
    }
    if (strlen($request->input('password')) > 50) {
        return json_encode(["status"=>"error", "description"=>"Password must be shorter than 50 chars"]);
    }
    $user = new User;
    $user->login = $request->input('login');
    $user->password = hash('sha512', $request->input('password'));
    $user->avatar = "";
    $user->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/user/check', function(Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    return json_encode(["status"=>"ok", "data"=>$user->id]);
});

Route::post('user/change/avatar', function (Request $request) {
    if (empty($request->input('login'))) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (empty($request->input('password'))) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->hasFile('avatar')) {
        return json_encode(["status"=>"error", "description"=>"File is required"]);
    }
    if (!$request->file('avatar')->isValid()) {
        return json_encode(["status"=>"error", "description"=>"Upload unsuccessful"]);
    }
    if (!(($request->file('avatar')->getMimeType() == "image/png") || ($request->file('avatar')->getMimeType() == "image/jpeg"))) {
        return json_encode(["status"=>"error", "description"=>"Required format is jpeg or png"]);
    }
    if ($request->file('avatar')->getSize() > 4294967296) {
        return json_encode(["status"=>"error", "description"=>"File is bigger than 4GB"]);
    }
    $filename = $request->file('avatar')->store("img");
    if (($user->avatar !== "") && (Storage::exists($user->avatar))) {
        Storage::delete($user->avatar);
    }
    $user->avatar = $filename;
    $user->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('user/change/login', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('newLogin')) {
        return json_encode(["status"=>"error", "description"=>"New login is required"]);
    }
    if (strlen($request->input('newLogin')) < 5) {
        return json_encode(["status"=>"error", "description"=>"New login must be longer than 5 chars"]);
    }
    if (strlen($request->input('newLogin')) > 50) {
        return json_encode(["status"=>"error", "description"=>"New login must be shorter than 50 chars"]);
    }
    if (count(User::where("login", $request->input('newLogin'))->get()) > 0) {
        return json_encode(["status"=>"error", "description"=>"New login is already taken"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if(empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    $user->login = $request->input('newLogin');
    $user->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('user/change/password', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    if (!$request->has('newPassword')) {
        return json_encode(["status"=>"error", "description"=>"New password is required"]);
    }
    if (strlen($request->input('newPassword')) < 5) {
        return json_encode(["status"=>"error", "description"=>"New password must be longer than 5 chars"]);
    }
    if (strlen($request->input('newPassword')) > 50) {
        return json_encode(["status"=>"error", "description"=>"New password must be shorter than 50 chars"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if(empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    $user->password = hash('sha512', $request->input('newPassword'));
    $user->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('user/avatar', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if(empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $user2 = User::find($request->input('id'));
    if (empty($user2)) {
        return json_encode(["status"=>"error", "description"=>"User with this id does not exist"]);
    }
    return json_encode(["status"=>"ok", "data"=>$user2->avatar]);
});

Route::post('/game/list', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('searchString')) {
        return json_encode(["status"=>"error", "description"=>"SearchString is required"]);
    }
    if (strlen($request->input('searchString')) > 50) {
        return json_encode(["status"=>"error", "description"=>"SearchString must be shorter than 50 chars"]);
    }
    if (!$request->has('pageSize')) {
        return json_encode(["status"=>"error", "description"=>"PageSize is required"]);
    }
    if (!is_numeric($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't number"]);
    }
    if (!is_int($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't integer"]);
    }
    if ($request->input('pageSize') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't non-negative"]);
    }
    if (!$request->has('pageNumber')) {
        return json_encode(["status"=>"error", "description"=>"PageNumber is required"]);
    }
    if (!is_numeric($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't number"]);
    }
    if (!is_int($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't integer"]);
    }
    if ($request->input('pageNumber') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't non-negative"]);
    }
    $answer = [];
    $games = [];
    if ($request->input('searchString') == "") {
        $gamesList = Game::orderBy('name', 'ASC')->get()->all();
        $games = array_slice($gamesList, 0, ($request->input('pageSize') * $request->input('pageNumber')));
        logOut("działa");
        logOut($games);
    } else {
        $gamesList = Game::where('name', 'like', '%' . $request->input('searchString') . '%')
            ->orWhere('sport', 'like', '%' . $request->input('searchString') . '%')
            ->orWhere('location', 'like', '%' . $request->input('searchString') . '%')
            ->orderBy('name', 'ASC')->get()->all();
        $games = array_slice($gamesList, 0, ($request->input('pageSize') * $request->input('pageNumber')));
    }
    for ($i = 0; $i < count($games); $i++) {
        $temp = [];
        $temp["id"] = $games[$i]["id"];
        $temp["name"] = $games[$i]["name"];
        $temp["sport"] = $games[$i]["sport"];
        $temp["advancement"] = $games[$i]["advancement"];
        $temp["location"] = $games[$i]["location"];
        $temp["time"] = $games[$i]["time"];
        $temp["price"] = $games[$i]["price"];
        $temp["people_counter"] = $games[$i]["people_counter"];
        $temp["users"] = [];
        $userGameRole = UserGameRole::where("game", $games[$i]["id"])->get();
        for ($j = 0; $j < count($userGameRole); $j++) {
            $base = User::find($userGameRole[$j]->user);
            $user = ["id"=>$base->id, "login"=>$base->login, "avatar"=>$base->avatar];
            $temp["users"][$j] = $user;
        }
        $answer[$i] = $temp;
    }
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/game/get', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if(empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $game = Game::find($request->input('id'));
    if(empty($game)) {
        return json_encode(["status"=>"error", "description"=>"Game isn't exist"]);
    }
    $answer = [];
    $answer["id"] = $game["id"];
    $answer["name"] = $game["name"];
    $answer["sport"] = $game["sport"];
    $answer["advancement"] = $game["advancement"];
    $answer["location"] = $game["location"];
    $answer["time"] = $game["time"];
    $answer["price"] = $game["price"];
    $answer["people_counter"] = $game["people_counter"];
    $answer["users"] = [];
    $userGameRole = UserGameRole::where("game", $game["id"])->get();
    $answer["is_admin"] = false;
    for ($j = 0; $j < count($userGameRole); $j++) {
        $temp = User::find($userGameRole[$j]->user);
        $users = ["id"=>$temp->id, "login"=>$temp->login, "avatar"=>$temp->avatar];
        if (($user->id === $temp->id)&&($userGameRole[$j]->role === "właściciel")) {
            $answer["is_admin"] = true;
        }
        $answer["users"][$j] = $users;
    }
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/game/create', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('name')) {
        return json_encode(["status"=>"error", "description"=>"Name is required"]);
    }
    if (strlen($request->input('name')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Name must be longer than 5 chars"]);
    }
    if (strlen($request->input('name')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Name must be shorter than 200 chars"]);
    }
    if (!$request->has('sport')) {
        return json_encode(["status"=>"error", "description"=>"Sport is required"]);
    }
    if (strlen($request->input('sport')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Sport must be longer than 5 chars"]);
    }
    if (strlen($request->input('sport')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Sport must be shorter than 200 chars"]);
    }
    if (!$request->has('advancement')) {
        return json_encode(["status"=>"error", "description"=>"Advancement is required"]);
    }
    if (!is_numeric($request->input('advancement'))) {
        return json_encode(["status"=>"error", "description"=>"Advancement must be a number in the range of 0 to 10"]);
    }
    if (strlen($request->input('advancement')) < 0) {
        return json_encode(["status"=>"error", "description"=>"Advancement must be in the range of 0 to 10"]);
    }
    if (strlen($request->input('advancement')) > 10) {
        return json_encode(["status"=>"error", "description"=>"Advancement must be in the range of 0 to 10"]);
    }
    if (!$request->has('location')) {
        return json_encode(["status"=>"error", "description"=>"Location is required"]);
    }
    if (strlen($request->input('location')) < 10) {
        return json_encode(["status"=>"error", "description"=>"Location must be longer than 10 chars"]);
    }
    if (strlen($request->input('location')) > 500) {
        return json_encode(["status"=>"error", "description"=>"Location must be shorter than 500 chars"]);
    }
    if (!$request->has('time')) {
        return json_encode(["status"=>"error", "description"=>"Time is required"]);
    }
    if (!datetimeCheck($request->input('time'))) {
        return json_encode(["status"=>"error", "description"=>"Time format is invalid"]);
    }
    if (!$request->has('price')) {
        return json_encode(["status"=>"error", "description"=>"Price is required"]);
    }
    if(!is_numeric($request->input('price'))) {
        return json_encode(["status"=>"error", "description"=>"Price must be a number"]);
    }
    if ($request->input('price') < 0) {
        return json_encode(["status"=>"error", "description"=>"Price can't be a negative number"]);
    }
    if (!$request->has('people_counter')) {
        return json_encode(["status"=>"error", "description"=>"People_counter is required"]);
    }
    if(!is_numeric($request->input('people_counter'))) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be a number in the range of 0 to 10"]);
    }
    if ($request->input('people_counter') <= 0) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be in the range of 1 to 40"]);
    }
    if ($request->input('people_counter') > 40) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be in the range of 1 to 40"]);
    }
    $game = new Game;
    $game->name = $request->input('name');
    $game->sport = $request->input('sport');
    $game->advancement = (int)$request->input('advancement');
    $game->location = $request->input('location');
    $game->time = $request->input('time');
    $game->price = $request->input('price');
    $game->people_counter = $request->input('people_counter');
    $game->save();
    $UserGameRole = new UserGameRole;
    $UserGameRole->user = $user->id;
    $UserGameRole->game = $game->id;
    $UserGameRole->role = "właściciel";
    $UserGameRole->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/game/join', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $game = Game::find($request->input('id'));
    if(empty($game)) {
        return json_encode(["status"=>"error", "description"=>"Game isn't exist"]);
    }
    $participant = UserGameRole::where('user', $user->id)->where('game', $game->id)->first();
    if (!empty($participant)) {
        return json_encode(["status"=>"error", "description"=>"You are already a participant in this course"]);
    }
    $UserGameRole = new UserGameRole;
    $UserGameRole->user = $user->id;
    $UserGameRole->game = $game->id;
    $UserGameRole->role = "uczestnik";
    $UserGameRole->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/game/leave', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $game = Game::find($request->input('id'));
    if(empty($game)) {
        return json_encode(["status"=>"error", "description"=>"Game isn't exist"]);
    }
    $userGameRole = UserGameRole::where('role', 'właściel')
        ->where('game', $game->id)
        ->where('user', $user->id)->get();
    if (empty($userGameRole)) {
        return json_encode(["status"=>"error", "description"=>"Owner can't leave game"]);
    }
    $participant = UserGameRole::where('user', $user->id)->where('game', $game->id)->first();
    $participant->delete();
    return json_encode(["status"=>"ok"]);
});

Route::post('/game/change', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $game = Game::find($request->input('id'));
    if(empty($game)) {
        return json_encode(["status"=>"error", "description"=>"Game isn't exist"]);
    }
    $userGameRole = UserGameRole::where('role', 'właściciel')
        ->where('game', $game->id)
        ->where('user', $user->id)->get();
    if (empty($userGameRole)) {
        return json_encode(["status"=>"error", "description"=>"Only the owner can change the game"]);
    }
    if (!$request->has('name')) {
        return json_encode(["status"=>"error", "description"=>"Name is required"]);
    }
    if (strlen($request->input('name')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Name must be longer than 5 chars"]);
    }
    if (strlen($request->input('name')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Name must be shorter than 200 chars"]);
    }
    if (!$request->has('sport')) {
        return json_encode(["status"=>"error", "description"=>"Sport is required"]);
    }
    if (strlen($request->input('sport')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Sport must be longer than 5 chars"]);
    }
    if (strlen($request->input('sport')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Sport must be shorter than 200 chars"]);
    }
    if (!$request->has('advancement')) {
        return json_encode(["status"=>"error", "description"=>"Advancement is required"]);
    }
    if (!is_numeric($request->input('advancement'))) {
        return json_encode(["status"=>"error", "description"=>"Advancement must be a number in the range of 0 to 10"]);
    }
    if (strlen($request->input('advancement')) < 0) {
        return json_encode(["status"=>"error", "description"=>"Advancement must be in the range of 0 to 10"]);
    }
    if (strlen($request->input('advancement')) > 10) {
        return json_encode(["status"=>"error", "description"=>"Advancement must be in the range of 0 to 10"]);
    }
    if (!$request->has('location')) {
        return json_encode(["status"=>"error", "description"=>"Location is required"]);
    }
    if (strlen($request->input('location')) < 10) {
        return json_encode(["status"=>"error", "description"=>"Location must be longer than 10 chars"]);
    }
    if (strlen($request->input('location')) > 500) {
        return json_encode(["status"=>"error", "description"=>"Location must be shorter than 500 chars"]);
    }
    if (!$request->has('time')) {
        return json_encode(["status"=>"error", "description"=>"Time is required"]);
    }
    if (!datetimeCheck($request->input('time'))) {
        return json_encode(["status"=>"error", "description"=>"Time format is invalid"]);
    }
    if (!$request->has('price')) {
        return json_encode(["status"=>"error", "description"=>"Price is required"]);
    }
    if(!is_numeric($request->input('price'))) {
        return json_encode(["status"=>"error", "description"=>"Price must be a number"]);
    }
    if ($request->input('price') < 0) {
        return json_encode(["status"=>"error", "description"=>"Price can't be a negative number"]);
    }
    if (!$request->has('people_counter')) {
        return json_encode(["status"=>"error", "description"=>"People_counter is required"]);
    }
    if(!is_numeric($request->input('people_counter'))) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be a number in the range of 0 to 10"]);
    }
    if ($request->input('people_counter') <= 0) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be in the range of 1 to 40"]);
    }
    if ($request->input('people_counter') > 40) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be in the range of 1 to 40"]);
    }
    if ($request->input('people_counter') < count(UserGameRole::where('game', $game->id)->get())) {
        return json_encode(["status"=>"error", "description"=>"People_counter must be greater or equal than number of users participated"]);
    }
    $game->name = $request->input('name');
    $game->sport = $request->input('sport');
    $game->advancement = (int)$request->input('advancement');
    $game->location = $request->input('location');
    $game->time = $request->input('time');
    $game->price = $request->input('price');
    $game->people_counter = $request->input('people_counter');
    $game->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/game/users/remove', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('idGame')) {
        return json_encode(["status"=>"error", "description"=>"IdGame is required"]);
    }
    if (!is_numeric($request->input('idGame'))) {
        return json_encode(["status"=>"error", "description"=>"IdGame isn't number"]);
    }
    $game = Game::find($request->input('idGame'));
    if (empty($game)) {
        return json_encode(["status"=>"error", "description"=>"Game isn't exist"]);
    }
    $userGameRole = UserGameRole::where('role', 'właściciel')
        ->where('game', $game->id)
        ->where('user', $user->id)->get();
    if (empty($userGameRole)) {
        return json_encode(["status"=>"error", "description"=>"Only the owner can remove participants"]);
    }
    if (!$request->has('idUser')) {
        return json_encode(["status"=>"error", "description"=>"IdUser is required"]);
    }
    if (!is_numeric($request->input('idUser'))) {
        return json_encode(["status"=>"error", "description"=>"IdUser isn't number"]);
    }
    $user2 = User::find($request->input('idUser'));
    if (empty($user2)) {
        return json_encode(["status"=>"error", "description"=>"User isn't exist"]);
    }
    $userGameRole2 = UserGameRole::where('role', 'uczestnik')
        ->where('game', $game->id)
        ->where('user', $user2->id)->get();
    if(empty($userGameRole2)) {
        return json_encode(["status"=>"error", "description"=>"The user is not signed in to the game"]);
    }
    $userGameRole2[0]->delete();
    return json_encode(["status"=>"ok"]);
});

Route::post('/game/users/create/list', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('searchString')) {
        return json_encode(["status"=>"error", "description"=>"SearchString is required"]);
    }
    if (strlen($request->input('searchString')) > 50) {
        return json_encode(["status"=>"error", "description"=>"SearchString must be shorter than 50 chars"]);
    }
    if (!$request->has('pageSize')) {
        return json_encode(["status"=>"error", "description"=>"PageSize is required"]);
    }
    if (!is_numeric($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't number"]);
    }
    if (!is_int($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't integer"]);
    }
    if ($request->input('pageSize') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't non-negative"]);
    }
    if (!$request->has('pageNumber')) {
        return json_encode(["status"=>"error", "description"=>"PageNumber is required"]);
    }
    if (!is_numeric($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't number"]);
    }
    if (!is_int($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't integer"]);
    }
    if ($request->input('pageNumber') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't non-negative"]);
    }
    $userGameRole = UserGameRole::where('user', $user->id)->where('role', 'właściciel')->get();
    $answer = [];
    if ($request->input('searchString') === "") {
        for ($i = 0; $i < count($userGameRole); $i++) {
            $game = Game::find($userGameRole[$i]->game);
            $users = UserGameRole::where('game', $game->id)->get();
            $logins = [];
            for ($j = 0; $j < count($users); $j++) {
                $user = User::find($users[$j]->user);
                $logins[$j] = (object) ["id"=>$user->id, "login"=>$user->login];
            }
            $temp = [];
            $temp["id"] = $game->id;
            $temp["name"] = $game->name;
            $temp["sport"] = $game->sport;
            $temp["advancement"] = $game->advancement;
            $temp["location"] = $game->location;
            $temp["time"] = $game->time;
            $temp["price"] = $game->price;
            $temp["people_counter"] = $game->people_counter;
            $temp["users"] = $logins;
            $answer[$i] = $temp;
        }
    } else {
        for ($i = 0; $i < count($userGameRole); $i++) {
            $game = Game::find($userGameRole[$i]->game);
            $flag1 = false;
            $flag2 = false;
            $flag3 = false;
            if (strpos($game->name, $request->input('searchString')) === false) {
                $flag1 = true;
            }
            if (strpos($game->sport, $request->input('searchString')) === false) {
                $flag2 = true;
            }
            if (strpos($game->location, $request->input('searchString')) === false) {
                $flag3 = true;
            }
            if ($flag1&&$flag2&&$flag3) break;
            $users = UserGameRole::where('game', $game->id)->get();
            $logins = [];
            for ($j = 0; $j < count($users); $j++) {
                $user = User::find($users[$j]->user);
                $logins[$j] = (object) ["id"=>$user->id, "login"=>$user->login];
            }
            $temp = [];
            $temp["id"] = $game->id;
            $temp["name"] = $game->name;
            $temp["sport"] = $game->sport;
            $temp["advancement"] = $game->advancement;
            $temp["location"] = $game->location;
            $temp["time"] = $game->time;
            $temp["price"] = $game->price;
            $temp["people_counter"] = $game->people_counter;
            $temp["users"] = $logins;
            $answer[count($answer)] = $temp;
        }
    }
    $answer = array_slice($answer, 0, ($request->input("pageSize") * $request->input("pageNumber")));
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/game/users/join/list', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('searchString')) {
        return json_encode(["status"=>"error", "description"=>"SearchString is required"]);
    }
    if (strlen($request->input('searchString')) > 50) {
        return json_encode(["status"=>"error", "description"=>"SearchString must be shorter than 50 chars"]);
    }
    if (!$request->has('pageSize')) {
        return json_encode(["status"=>"error", "description"=>"PageSize is required"]);
    }
    if (!is_numeric($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't number"]);
    }
    if (!is_int($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't integer"]);
    }
    if ($request->input('pageSize') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't non-negative"]);
    }
    if (!$request->has('pageNumber')) {
        return json_encode(["status"=>"error", "description"=>"PageNumber is required"]);
    }
    if (!is_numeric($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't number"]);
    }
    if (!is_int($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't integer"]);
    }
    if ($request->input('pageNumber') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't non-negative"]);
    }
    $userGameRole = UserGameRole::where('user', $user->id)->where('role', 'uczestnik')->get();
    $answer = [];
    if ($request->input('searchString') === "") {
        for ($i = 0; $i < count($userGameRole); $i++) {
            $game = Game::find($userGameRole[$i]->game);
            $users = UserGameRole::where('game', $game->id)->get();
            $logins = [];
            for ($j = 0; $j < count($users); $j++) {
                $user = User::find($users[$j]->user);
                $logins[$j] = (object) ["id"=>$user->id, "login"=>$user->login];
            }
            $temp = [];
            $temp["id"] = $game->id;
            $temp["name"] = $game->name;
            $temp["sport"] = $game->sport;
            $temp["advancement"] = $game->advancement;
            $temp["location"] = $game->location;
            $temp["time"] = $game->time;
            $temp["price"] = $game->price;
            $temp["people_counter"] = $game->people_counter;
            $temp["users"] = $logins;
            $answer[$i] = $temp;
        }
    } else {
        for ($i = 0; $i < count($userGameRole); $i++) {
            $game = Game::find($userGameRole[$i]->game);
            $flag1 = false;
            $flag2 = false;
            $flag3 = false;
            if (strpos($game->name, $request->input('searchString')) === false) {
                $flag1 = true;
            }
            if (strpos($game->sport, $request->input('searchString')) === false) {
                $flag2 = true;
            }
            if (strpos($game->location, $request->input('searchString')) === false) {
                $flag3 = true;
            }
            if ($flag1&&$flag2&&$flag3) break;
            $users = UserGameRole::where('game', $game->id)->get();
            $logins = [];
            for ($j = 0; $j < count($users); $j++) {
                $user = User::find($users[$j]->user);
                $logins[$j] = (object) ["id"=>$user->id, "login"=>$user->login];
            }
            $temp = [];
            $temp["id"] = $game->id;
            $temp["name"] = $game->name;
            $temp["sport"] = $game->sport;
            $temp["advancement"] = $game->advancement;
            $temp["location"] = $game->location;
            $temp["time"] = $game->time;
            $temp["price"] = $game->price;
            $temp["people_counter"] = $game->people_counter;
            $temp["users"] = $logins;
            $answer[count($answer)] = $temp;
        }
    }
    $answer = array_slice($answer, 0, ($request->input("pageSize") * $request->input("pageNumber")));
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/group/list', function (Request $request) {
    logOut($request);
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('searchString')) {
        return json_encode(["status"=>"error", "description"=>"SearchString is required"]);
    }
    if (strlen($request->input('searchString')) > 50) {
        return json_encode(["status"=>"error", "description"=>"SearchString must be shorter than 50 chars"]);
    }
    if (!$request->has('pageSize')) {
        return json_encode(["status"=>"error", "description"=>"PageSize is required"]);
    }
    if (!is_numeric($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't number"]);
    }
    if (!is_int($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't integer"]);
    }
    if ($request->input('pageSize') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't non-negative"]);
    }
    if (!$request->has('pageNumber')) {
        return json_encode(["status"=>"error", "description"=>"PageNumber is required"]);
    }
    if (!is_numeric($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't number"]);
    }
    if (!is_int($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't integer"]);
    }
    if ($request->input('pageNumber') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't non-negative"]);
    }
    $answer = [];
    $group = [];
    $userGroupRoleList = UserGroupRole::where('user', $user->id)->get()->all();
    $userGroupRoleSlice = array_slice($userGroupRoleList, 0, ($request->input('pageSize') * $request->input('pageNumber')));
    if ($request->input('searchString') === "") {
         for ($i = 0; $i < count($userGroupRoleSlice); $i++) {
            $group[$i] = Group::find($userGroupRoleSlice[$i]->group);
        }
    } else {
        for ($i = 0; $i < count($userGroupRoleSlice); $i++) {
            $temp = Group::find($userGroupRoleSlice[$i]->group);
            if (strpos($temp->name, $request->input('searchString')) === false) break;
            $group[count($group)] = $temp;
        }
    }
    for ($i = 0; $i < count($group); $i++) {
        $temp = [];
        $temp["id"] = $group[$i]->id;
        $temp["name"] = $group[$i]->name;
        $answer[$i] = $temp;
    }
    usort($answer, fn($a, $b) => strcmp($a["name"], $b["name"]));
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/group/get', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $group = Group::find($request->input('id'));
    if (empty($group)) {
        return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
    }
    $userGroupRoleParticipant = UserGroupRole::where('user', $user->id)->where('group', $group->id)->get();
    if (empty($userGroupRoleParticipant)) {
        return json_encode(["status"=>"error", "description"=>"You don't participate in this group"]);
    }
    $answer = [];
    $answer["is_admin"] = !empty(UserGroupRole::where('role', 'właściciel')->where('user', $user->id)->where('group', $group->id)->get());
    $users = [];
    $usersId = UserGroupRole::where('group', $group->id)->get();
    foreach ($usersId as $u) {
        $temp = User::find($u->user);
        $users[count($users)] = ["id" => $temp->id, "login" => $temp->login];
    }
    $answer["users"] = $users;
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/group/create', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('name')) {
        return json_encode(["status"=>"error", "description"=>"Name is required"]);
    }
    if (strlen($request->input('name')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Name must be longer than 5 chars"]);
    }
    if (strlen($request->input('name')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Name must be shorter than 200 chars"]);
    }
    $group = new Group;
    $group->name = $request->input('name');
    $group->owner = $user->id;
    $group->save();
    $userGroup = new UserGroupRole;
    $userGroup->user = $user->id;
    $userGroup->role = "właściciel";
    $userGroup->group = $group->id;
    $userGroup->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/group/change', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $group = Group::find($request->input('id'));
    if (empty($group)) {
        return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
    }
    $userGroup = UserGroupRole::where('group', $request->input('id'))
        ->where('user', $user->id)
        ->where('role', 'właściciel')->get();
    if (empty($userGroup)) {
        return json_encode(["status"=>"error", "description"=>"Only owner can change this group name"]);
    }
    if (!$request->has('name')) {
        return json_encode(["status"=>"error", "description"=>"Name is required"]);
    }
    if (strlen($request->input('name')) < 5) {
        return json_encode(["status"=>"error", "description"=>"Name must be longer than 5 chars"]);
    }
    if (strlen($request->input('name')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Name must be shorter than 200 chars"]);
    }
    $group->name = $request->input('name');
    $group->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/group/delete', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $group = Group::find($request->input('id'));
    if (empty($group)) {
        return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
    }
    $userGroup = UserGroupRole::where('group', $request->input('id'))
        ->where('user', $user->id)
        ->where('role', 'właściciel')->get();
    if (empty($userGroup)) {
        return json_encode(["status"=>"error", "description"=>"Only owner can delete this group"]);
    }
    $group->delete();
    for ($i = 0; $i < count($userGroup); $i++) {
        $userGroup[$i]->delete();
    }
    return json_encode(["status"=>"ok"]);
});

Route::post('/group/join', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('idUser')) {
        return json_encode(["status"=>"error", "description"=>"IdUser is required"]);
    }
    if (!is_numeric($request->input('idUser'))) {
        return json_encode(["status"=>"error", "description"=>"IdUser isn't number"]);
    }
    $user2 = User::find($request->input('idUser'));
    if (empty($user2)) {
        return json_encode(["status"=>"error", "description"=>"User isn't exist"]);
    }
    if (!$request->has('idGroup')) {
        return json_encode(["status"=>"error", "description"=>"IdGroup is required"]);
    }
    if (!is_numeric($request->input('idGroup'))) {
        return json_encode(["status"=>"error", "description"=>"IdGroup isn't number"]);
    }
    $group = Group::find($request->input('idGroup'));
    if (empty($group)) {
        return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
    }
    $userGroupRoleParticipant = UserGroupRole::where('user', $user2->id)->where('group', $group->id)->get();
    if (count($userGroupRoleParticipant) != 0) {
        return json_encode(["status"=>"error", "description"=>"User is already participant of a group"]);
    }
    $is_admin = !empty(UserGroupRole::where('role', 'właściciel')->where('user', $user->id)->where('group', $group->id)->get());
    if (!$is_admin) {
        return json_encode(["status"=>"error", "description"=>"Only the owner can add users to group"]);
    }
    $userGroupRole = new UserGroupRole;
    $userGroupRole->user = $user2->id;
    $userGroupRole->group = $group->id;
    $userGroupRole->role = "uczestnik";
    $userGroupRole->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/group/leave', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('idUser')) {
        return json_encode(["status"=>"error", "description"=>"IdUser is required"]);
    }
    if (!is_numeric($request->input('idUser'))) {
        return json_encode(["status"=>"error", "description"=>"IdUser isn't number"]);
    }
    $user2 = User::find($request->input('idUser'));
    if (empty($user2)) {
        return json_encode(["status"=>"error", "description"=>"User isn't exist"]);
    }
    if (!$request->has('idGroup')) {
        return json_encode(["status"=>"error", "description"=>"IdGroup is required"]);
    }
    if (!is_numeric($request->input('idGroup'))) {
        return json_encode(["status"=>"error", "description"=>"IdGroup isn't number"]);
    }
    $group = Group::find($request->input('idGroup'));
    if (empty($group)) {
        return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
    }
    $userGroupRoleParticipant = UserGroupRole::where('user', $user2->id)->where('group', $group->id)->get();
    if (empty($userGroupRoleParticipant)) {
        return json_encode(["status"=>"error", "description"=>"User isn't a participant of a group"]);
    }
    $is_admin = !empty(UserGroupRole::where('role', 'właściciel')->where('user', $user->id)->where('group', $group->id)->get());
    if ($is_admin && ($user->id == $user2->id)) {
        return json_encode(["status"=>"error", "description"=>"Owner can't leave group"]);
    }
    $userGroupRoleParticipant[0]->delete();
    return json_encode(["status"=>"ok"]);
});

Route::post('/user/list', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('searchString')) {
        return json_encode(["status"=>"error", "description"=>"SearchString is required"]);
    }
    if (strlen($request->input('searchString')) > 50) {
        return json_encode(["status"=>"error", "description"=>"SearchString must be shorter than 50 chars"]);
    }
    if (!$request->has('pageSize')) {
        return json_encode(["status"=>"error", "description"=>"PageSize is required"]);
    }
    if (!is_numeric($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't number"]);
    }
    if (!is_int($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't integer"]);
    }
    if ($request->input('pageSize') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't non-negative"]);
    }
    if (!$request->has('pageNumber')) {
        return json_encode(["status"=>"error", "description"=>"PageNumber is required"]);
    }
    if (!is_numeric($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't number"]);
    }
    if (!is_int($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't integer"]);
    }
    if ($request->input('pageNumber') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't non-negative"]);
    }
    $userList = [];
    $userSlice = [];
    if ($request->input('searchString') === "") {
        $userList = User::all()->all();
        $userSlice = array_slice($userList, 0, ($request->input('pageSize') * $request->input('pageNumber')));
    } else {
        $userList = User::where('login', 'like', '%' . $request->input('searchString') . '%')->get()->all();
        $userSlice = array_slice($userList, 0, ($request->input('pageSize') * $request->input('pageNumber')));
    }
    $answer = [];
    for ($i = 0; $i < count($userSlice); $i++) {    
        $answer[$i] = ["id"=>$userSlice[$i]->id, "login"=>$userSlice[$i]->login, "avatar"=>((!empty($userSlice[$i]->avatar)) ? $userSlice[$i]->avatar : "")];
    }
    return json_encode(["status"=>"ok", "data"=>$answer]);
});

Route::post('/message/list', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('type')) {
        return json_encode(["status"=>"error", "description"=>"Type is required"]);
    }
    if (!in_array($request->input('type'), ['user', 'group'])) {
        return json_encode(["status"=>"error", "description"=>"Type value is invalid"]);
    }
    $type = $request->input("type");
    if (!$request->has('target')) {
        return json_encode(["status"=>"error", "description"=>"Target is required"]);
    }
    if (!is_numeric($request->input('target'))) {
        return json_encode(["status"=>"error", "description"=>"Target isn't number"]);
    }
    if (!$request->has('pageSize')) {
        return json_encode(["status"=>"error", "description"=>"PageSize is required"]);
    }
    if (!is_numeric($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't number"]);
    }
    if (!is_int($request->input('pageSize'))) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't integer"]);
    }
    if ($request->input('pageSize') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageSize isn't non-negative"]);
    }
    if (!$request->has('pageNumber')) {
        return json_encode(["status"=>"error", "description"=>"PageNumber is required"]);
    }
    if (!is_numeric($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't number"]);
    }
    if (!is_int($request->input('pageNumber'))) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't integer"]);
    }
    if ($request->input('pageNumber') < 0) {
        return json_encode(["status"=>"error", "description"=>"PageNumber isn't non-negative"]);
    }
    if ($type === 'user') {
        $target = User::find($request->input('target'));
        if (empty($target)) {
            return json_encode(["status"=>"error", "description"=>"User isn't exist"]);
        }
        $messageUserSender = MessageUser::where('sender', $user->id)->where('receiver', $target->id)->get();
        $messageUserReceiver = [];
        if ($target->id != $user->id) {
            $messageUserReceiver = MessageUser::where('sender', $target->id)->where('receiver', $user->id)->get();
        }
        
        $answer = [];
        for ($i = 0; $i < count($messageUserSender); $i++) {
            $answer[count($answer)] = [
                "id"=>$messageUserSender[$i]->id,
                "sender"=>User::find($messageUserSender[$i]->sender)->login,
                "avatar"=>User::find($messageUserSender[$i]->sender)->avatar,
                "message"=>$messageUserSender[$i]->message,
                "isImage"=>$messageUserSender[$i]->isImage
            ];
        }
        for ($i = 0; $i < count($messageUserReceiver); $i++) {
            $answer[count($answer)] = [
                "id"=>$messageUserReceiver[$i]->id,
                "sender"=>User::find($messageUserReceiver[$i]->sender)->login,
                "avatar"=>User::find($messageUserReceiver[$i]->sender)->avatar,
                "message"=>$messageUserReceiver[$i]->message,
                "isImage"=>$messageUserReceiver[$i]->isImage
            ];
        }
        $indexes = [];
        foreach ($answer as $val) {
            $indexes[count($indexes)] = $val['id'];
        }
        sort($indexes);
        $segregatedAnswer = [];
        for ($i = 0; $i < count($indexes); $i++) {
            foreach ($answer as $val) {
                if ($val['id'] == $indexes[$i]) {
                    $segregatedAnswer[$i] = $val;
                }
            }
        }
        $segregatedAnswer = array_slice($segregatedAnswer, 0, ($request->input('pageSize') * $request->input('pageNumber')));
        return json_encode(["status"=>"ok", "data"=>$segregatedAnswer]);
    }
    if ($type === 'group') {
        $target = Group::find($request->input('target'));
        if (empty($target)) {
            return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
        }
        $messages = MessageGroup::where('receiver', $target->id)->get();
        $answer = [];
        for ($i = 0; $i < count($messages); $i++) {
            $answer[count($answer)] = [
                "id"=>$messages[$i]->id,
                "sender"=>User::find($messages[$i]->sender)->login,
                "message"=>$messages[$i]->message,
                "isImage"=>$messages[$i]->isImage
            ];
        }
        $indexes = [];
        foreach ($answer as $val) {
            $indexes[count($indexes)] = $val['id'];
        }
        sort($indexes);
        $segregatedAnswer = [];
        for ($i = 0; $i < count($indexes); $i++) {
            foreach ($answer as $val) {
                if ($val['id'] == $indexes[$i]) {
                    $segregatedAnswer[$i] = $val;
                }
            }
        }
        $segregatedAnswer = array_slice($segregatedAnswer, 0, ($request->input('pageSize') * $request->input('pageNumber')));
        return json_encode(["status"=>"ok", "data"=>$segregatedAnswer]);
    }
    return json_encode(["status"=>"error", "description"=>"Something gone wrong"]);
});

Route::post('/message/user/send-text', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $receiver = User::find($request->input('id'));
    if(empty($receiver)) {
        return json_encode(["status"=>"error", "description"=>"Receiver isn't exist"]);
    }
    if (!$request->has('message')) {
        return json_encode(["status"=>"error", "description"=>"Message is required"]);
    }
    if (strlen($request->input('message')) < 1) {
        return json_encode(["status"=>"error", "description"=>"Location must be longer than 0 chars"]);
    }
    if (strlen($request->input('message')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Location must be shorter than 200 chars"]);
    }
    $messageUser = new MessageUser;
    $messageUser->sender = $user->id;
    $messageUser->receiver = $receiver->id;
    $messageUser->message = $request->input("message");
    $messageUser->isImage = 0;
    $messageUser->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/message/group/send-text', function (Request $request) {
    if (!$request->has('login')) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (!$request->has('password')) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (!$request->has('id')) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $receiver = Group::find($request->input('id'));
    if(empty($receiver)) {
        return json_encode(["status"=>"error", "description"=>"Receiver isn't exist"]);
    }
    if (!$request->has('message')) {
        return json_encode(["status"=>"error", "description"=>"Message is required"]);
    }
    if (strlen($request->input('message')) < 1) {
        return json_encode(["status"=>"error", "description"=>"Location must be longer than 0 chars"]);
    }
    if (strlen($request->input('message')) > 200) {
        return json_encode(["status"=>"error", "description"=>"Location must be shorter than 200 chars"]);
    }
    $messageGroup = new MessageGroup;
    $messageGroup->sender = $user->id;
    $messageGroup->receiver = $receiver->id;
    $messageGroup->message = $request->input("message");
    $messageGroup->isImage = 0;
    $messageGroup->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/message/user/send-image', function (Request $request) {
    if (empty($request->input('login'))) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (empty($request->input('password'))) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (empty($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $receiver = User::find($request->input('id'));
    if(empty($receiver)) {
        return json_encode(["status"=>"error", "description"=>"Receiver isn't exist"]);
    }
    if (!$request->hasFile('image')) {
        return json_encode(["status"=>"error", "description"=>"File is required"]);
    }
    if (!$request->file('image')->isValid()) {
        return json_encode(["status"=>"error", "description"=>"Upload unsuccessful"]);
    }
    if (!(($request->file('image')->getMimeType() == "image/png") || ($request->file('image')->getMimeType() == "image/jpeg"))) {
        return json_encode(["status"=>"error", "description"=>"Required format is jpeg or png"]);
    }
    if ($request->file('image')->getSize() > 4294967296) {
        return json_encode(["status"=>"error", "description"=>"File is bigger than 4GB"]);
    }
    $filename = $request->file('image')->store("img");
    $image = Image::make(Storage::disk('local')->path($filename));
    if ($image->width() > $image->height()) {
        $image->widen(200);
    } else {
        $image->heighten(200);
    }
    $image->save();
    $messageUser = new MessageUser;
    $messageUser->sender = $user->id;
    $messageUser->receiver = $receiver->id;
    $messageUser->message = $filename;
    $messageUser->isImage = 1;
    $messageUser->save();
    return json_encode(["status"=>"ok"]);
});

Route::post('/message/group/send-image', function (Request $request) {
    if (empty($request->input('login'))) {
        return json_encode(["status"=>"error", "description"=>"Login is required"]);
    }
    if (empty($request->input('password'))) {
        return json_encode(["status"=>"error", "description"=>"Password is required"]);
    }
    $user = User::where('login', $request->input('login'))->where('password', hash('sha512', $request->input('password')))->first();
    if (empty($user)) {
        return json_encode(["status"=>"error", "description"=>"Wrong login or password"]);
    }
    if (empty($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id is required"]);
    }
    if (!is_numeric($request->input('id'))) {
        return json_encode(["status"=>"error", "description"=>"Id isn't number"]);
    }
    $receiver = Group::find($request->input('id'));
    if(empty($receiver)) {
        return json_encode(["status"=>"error", "description"=>"Group isn't exist"]);
    }
    if (!$request->hasFile('image')) {
        return json_encode(["status"=>"error", "description"=>"File is required"]);
    }
    if (!$request->file('image')->isValid()) {
        return json_encode(["status"=>"error", "description"=>"Upload unsuccessful"]);
    }
    if (!(($request->file('image')->getMimeType() == "image/png") || ($request->file('image')->getMimeType() == "image/jpeg"))) {
        return json_encode(["status"=>"error", "description"=>"Required format is jpeg or png"]);
    }
    if ($request->file('image')->getSize() > 4294967296) {
        return json_encode(["status"=>"error", "description"=>"File is bigger than 4GB"]);
    }
    $filename = $request->file('image')->store("img");
    $image = Image::make(Storage::disk('local')->path($filename));
    if ($image->width() > $image->height()) {
        $image->widen(200);
    } else {
        $image->heighten(200);
    }
    $image->save();
    $messageGroup = new MessageGroup;
    $messageGroup->sender = $user->id;
    $messageGroup->receiver = $receiver->id;
    $messageGroup->message = $filename;
    $messageGroup->isImage = 1;
    $messageGroup->save();
    return json_encode(["status"=>"ok"]);
});

Route::get('/img/{adres}', function ($adres) {
    if (empty(Storage::get('img/' . $adres))) {
        return json_encode(["status"=>"error", "description"=>"File not exist"]);
    }
    logOut('img/' . $adres);
    return Image::make(Storage::get('img/' . $adres))->response("jpg", 100);
});

Route::fallback(function () {
    return "404 - bro :(";
});