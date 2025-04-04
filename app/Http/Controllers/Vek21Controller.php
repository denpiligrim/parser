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

    public function getProductImages(Request $request)
    {
        // Получаем параметр "text" из запроса
        $query = $request->get('text');

        if (empty($query)) {
            return response()->json(['error' => 'Parameter "text" is required.'], 400);
        }

        try {
            // Формируем URL для поиска
            $url = "https://yandex.ru/images/search?text=" . urlencode($query);
            sleep(2); // Спим 2 секунды

            // Отправляем GET-запрос к Яндексу
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.9,ru;q=0.8',
                'Referer' => 'https://yandex.ru/',
                'Cookie' => 'my=YwA=; yuidss=6379049471729968605; yandexuid=6379049471729968605; yashr=8969451651729968605; receive-cookie-deprecation=1; font_loaded=YSv1; yandex_gid=45; yp=1739903677.ygu.1#1737916169.szm.1_25%3A1536x864%3A1519x776#4294967295.skin.s#1742498033.atds.1; skid=5074020831737317905; is_gdpr=1; is_gdpr_b=CIq4ORDwqgIYASgC; bh=EkAiTm90IEEoQnJhbmQiO3Y9IjgiLCAiQ2hyb21pdW0iO3Y9IjEzMiIsICJHb29nbGUgQ2hyb21lIjt2PSIxMzIiGgUieDg2IiIPIjEzMi4wLjY4MzQuODMiKgI/MDICIiI6CSJXaW5kb3dzIkIIIjE5LjAuMCJKBCI2NCJSWiJOb3QgQShCcmFuZCI7dj0iOC4wLjAuMCIsICJDaHJvbWl1bSI7dj0iMTMyLjAuNjgzNC44MyIsICJHb29nbGUgQ2hyb21lIjt2PSIxMzIuMC42ODM0LjgzIloCPzBg9Oa1vAZqHtzK4f8IktihsQOfz+HqA/v68OcN6//99g+h6M+HCA=='
            ])->get($url);

            // Проверяем успешность ответа
            if (!$response->ok()) {
                return response()->json(['error' => 'Failed to fetch data from Yandex Images.'], 500);
            }

            // Возвращаем HTML-ответ без изменений
            return response($response->body(), $response->status())
                ->header('Content-Type', 'text/html');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
