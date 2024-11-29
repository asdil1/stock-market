import { Builder, By, Key, until } from 'selenium-webdriver';

(async function testApp(){
    let driver = await new Builder().forBrowser('chrome').build();

    try{
        await driver.get('http://localhost:8080');

        // Ждём, пока элемент <select> станет доступным
        const selectElement = await driver.findElement(By.id('existing-names'));
        await selectElement.click();

        // Ожидаем загрузки всех опций
        await driver.wait(until.elementLocated(By.css('#existing-names option')), 10000);

        const options = await selectElement.findElements(By.tagName('option'));

        for(let option of options) {
            const optionText = await option.getText();

            if(optionText === 'dima'){
                await option.click();
                console.log(`Выбрано значение: ${optionText}`);
                break;
            }
        }

        await driver.findElement(By.className('login-button')).click();

        await driver.wait(until.urlContains('main'), 10000)

        // Ждём, пока список акций станет доступным
        const stockContainer = await driver.findElement(By.className('stock-container'));
        await driver.wait(until.elementLocated(By.css('.stock-item')), 10000);

        const stockSymbolElement = await stockContainer.findElement(By.xpath(`//span[contains(text(), 'AAPL')]`));

        // Получаем родителя (контейнер для акции) с текущего узла ищем предка
        const stockItem = await stockSymbolElement.findElement(By.xpath('./ancestor::li'));

        // В контейнере ищем кнопку "Купить" с текущего узла ищем среди всех потомков кнопку с текстом
        const buyButton = await stockItem.findElement(By.xpath(`.//button[contains(text(), 'Купить')]`));

        // Кликаем по кнопке
        await buyButton.click();
        console.log('Кнопка "Купить" для AAPL нажата.');

        // Ждём, пока модальное окно станет видимым
        await driver.wait(until.elementLocated(By.className('modal-overlay')), 10000)

        // Проверяем, что модальное окно отображается
        const modal = await driver.findElement(By.className('modal-overlay'));
        const isModalVisible = await modal.isDisplayed();
        console.log(`Видно модальное окно: ${isModalVisible}`);

        //Находим цену покупки
        const priceElement = await modal.findElement(By.xpath(".//p[contains(text(), 'Цена')]"));
        let price = await priceElement.getText();
        price = parseFloat(price.replace('Цена:', ''));
        console.log(`Цена покупки - ${price}`);

        // Вводим количество акций в поле
        const quantityInput = await driver.findElement(By.css('input[type="number"]'));
        await quantityInput.sendKeys('20');

        // Проверяем, активна ли кнопка "Подтвердить"
        const confirmButton = await driver.findElement(By.className('confirm-button'));
        const isConfirmButtonEnabled = await confirmButton.isEnabled();
        console.log(`Кнопка подтверждения доступна: ${isConfirmButtonEnabled}`);

        if (isConfirmButtonEnabled) {
            // Кликаем на кнопку "Подтвердить"
            await driver.sleep(1000);
            await confirmButton.click();
        }

        // Нажимаем кнопку "Отмена" (закрываем модальное окно)
        const cancelButton = await driver.findElement(By.xpath("//button[contains(text(), 'Отмена')]"));
        await cancelButton.click();
        console.log("Модальное окно закрыто");

        // Нажимаем на кнопку "Брокеры"
        const brokersButton = await driver.findElement(By.xpath("//button[contains(text(), 'Брокеры')]"));
        await brokersButton.click();

        // Ждем, пока загрузится список брокеров
        await driver.wait(until.elementLocated(By.className('brokers-container')), 5000);
        console.log("Перешли на страницу брокеров.");

        // Находим брокера с именем 'dima'
        const brokersList = await driver.findElement(By.className('broker-list'));
        const brokerElement = await brokersList.findElement(By.xpath(".//h3[contains(text(), 'dima')]"));

        // Находим контейнер информации о брокере (родительский элемент для найденного имени)
        const brokerInfo = await brokerElement.findElement(By.xpath("./ancestor::li"));

        // Находим элемент с общей прибылью внутри информации о брокере
        const stocksQuantity = await brokerInfo.findElement(By.xpath(".//span[contains(text(), 'Количество')]"));
        const quantityText = await stocksQuantity.getText();
        const quantity = parseInt(quantityText.replace("Количество:", ""));
        console.log(quantity);
        const stocksPrice = await brokerInfo.findElement(By.className("stock-price"));
        const stocks_price = await stocksPrice.getText();
        console.log(await stocksPrice.getText());

        if(parseFloat(stocks_price) === price){
            console.log("Цена покупки соответствует цене покупки в списке брокеров");
        } else {
            console.error("Цена покупки не соответствует");
        }
        if(quantity === 20){
            console.log("Количество купленных акций соответствует");
        } else {
            console.error("Количество купленных акций не равно 20")
        }

    } catch (error) {
        console.error('Ошибка во время выполнения теста:', error);
    }
    finally {
        await driver.quit();
    }
})();