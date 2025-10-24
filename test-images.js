// Тест доступности изображений
// Запустить в консоли браузера на странице товара

function testImageUrls() {
  const testUrls = [
    'https://electronic.tw1.ru/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (2).jpg',
    'https://electronic.tw1.ru/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (3).jpg',
    'https://electronic.tw1.ru/images/products/Phones/Apple/Iphone 16 blue/iphone_16_blue (4).jpg'
  ];
  
  console.log('🔍 Тестирование доступности изображений...');
  
  testUrls.forEach((url, index) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Изображение ${index + 1} загружено: ${url}`);
    };
    img.onerror = () => {
      console.log(`❌ Изображение ${index + 1} не загружено: ${url}`);
    };
    img.src = url;
  });
}

// Запустить тест
testImageUrls();
