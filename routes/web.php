<?php

use App\Http\Controllers\Vek21Controller;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::prefix('api/21vek')->group(function () {
  Route::post('/productList', [Vek21Controller::class, 'getProductList']);
  Route::post('/productData', [Vek21Controller::class, 'getProductData']);
  Route::get('/productImages', [Vek21Controller::class, 'getProductImages']);
});

Route::view('/{path}', 'welcome', [])
    ->where('path', '.*');
