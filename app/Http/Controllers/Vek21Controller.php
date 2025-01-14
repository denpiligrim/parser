<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class Vek21Controller extends Controller
{
    public function getProductList(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|string',
            'page' => 'required|integer',
        ]);

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ])->withQueryParameters(['page' => $validated['page']])->post('https://gate.21vek.by/product-listings/api/v2/initial-state', [
            'url' => $validated['url']
        ]);

        if ($response->successful()) {
            return response()->json($response->json(), 200);
        }

        return response()->json(['error' => 'Failed to fetch product list'], 500);
    }

    public function getProductData(Request $request)
    {
        $validated = $request->validate([
            'alias' => 'required|string',
        ]);

        $response = Http::withHeaders([
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ])->get('https://gate.21vek.by/product-card/products/' . $validated['alias'] . '/full');

        if ($response->successful()) {
            return response()->json($response->json(), 200);
        }

        return response()->json(['error' => 'Failed to fetch product data'], 500);
    }
}
