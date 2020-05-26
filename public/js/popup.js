window.addEventListener('load', () => {
    $('#navbarNav a#list').unbind();
    $('#navbarNav a#list').on('click', () => {
        $('#navSearch, #navbarNav').collapse('hide');
        $('.modal-body').css('max-height', $(window).height() * 0.7 + 'px');
        navControl();
        createPopupList();
    });
}, false);

function navControl() {
    $('.modal-header button').removeClass('active');
    $('.modal-header #all').addClass('active');
    $('.modal-header').unbind();
    var lastClicked = 'all';
    $('.modal-header').on('click', '.btn', (e) => {
        $('.modal-header .btn').removeClass('active');
        $('.modal-header').find('#' + e.target.id).addClass('active');
        if (e.target.id === 'co' && lastClicked !== 'co'){
            $('.modal-body .showing-Woolies').fadeOut();
            $('.modal-body .showing-Coles').fadeIn();
            lastClicked = 'co';
        }
        else if (e.target.id === 'ww' && lastClicked !== 'ww'){
            $('.modal-body .showing-Coles').fadeOut();
            $('.modal-body .showing-Woolies').fadeIn();
            lastClicked = 'ww';
        }
        else if (e.target.id === 'all' && lastClicked !== 'all'){
            $('.modal-body .showing').fadeIn();
            lastClicked = 'all';
        }
    });
}

function createPopupList() {
    $('#popupList #popupCard').remove('.showing');
    storedData.shownMap = [];
    if (storedData.SKUs.length > 0){
        for (let i = 0; i < storedData.qty.length; i++){
            getLowerPrice(i);
            $('#popupList .modal-body').append(createPopupCard(i).fadeIn());
        }
        updateTotalPrice();
    }
    navControl();
}

function createPopupCard(i) {
    var popupCard = $('#popupList #popupCard').first().clone();
    var altImg = 'https://shop.coles.com.au/wcsstore/ColesResponsiveStorefrontAssetStore/dist/d04b5953359411f41db65cc3fdc06d7d/img/img_product-placeholder.png';
    var data = storedData[storedData.shownMap[i][0]].cards[i];
    popupCard.addClass('showing').addClass('showing-' + storedData.shownMap[i][0]);
    if (storedData.shownMap[i][0] === 'Coles')
        popupCard.find('#title').text('Coles').css('background-color', '#de1f27');
    else popupCard.find('#title').text('Woolworths').css('background-color', '#178841');
    var url = (storedData.shownMap[i][0] === 'Coles') ? 'https://shop.coles.com.au' : '';
    popupCard.find('img').attr({
        'src': url + data.itemImage,
        'alt': data.itemBrand + ' ' + data.itemName,
        'onerror': "this.error=null;this.src='" + altImg + "'"
    });
    popupCard.find('#itemDesc').text(data.itemBrand + ' ' + data.itemName + ' ' + data.itemSize);
    popupCard.find('#discount, #promo').hide();
    if (data.itemSaving !== 0) {
        popupCard.find('#discount').text((data.itemSaving / (data.itemPrice + data.itemSaving) * 100).toFixed() + '%OFF');
        popupCard.find('#discount').show();
    }
    else if (data.itemPromoQty !== 0) {
        popupCard.find('#promo').text(data.itemPromoQty + ' for $' + data.itemPromoPrice / 100);
        popupCard.find('#promo').show();
    }
    popupCard.find('#price').text('$' + data.itemPrice / 100);
    changePriceFeature(i, popupCard, data);
    popupCard.find('#qty').text(storedData.qty[i]);
    if (storedData.qty[i] === 1) popupCard.find('#minus').addClass('disabled');
    controlPopupCards();
    return popupCard;
}

function getLowerPrice(index) {
    var map1 = ['Coles', 'Woolies'];
    var map2 = ['Woolies', 'Coles'];
    var cCard = storedData.Coles.cards[index];
    var wCard = storedData.Woolies.cards[index];
    if (!isEmptyJson(cCard) && !isEmptyJson(wCard)){
        if (cCard.itemPrice > wCard.itemPrice) storedData.shownMap.push(map2);
        else if (cCard.itemPrice === wCard.itemPrice && storedData.Coles.totalSaving < storedData.Woolies.totalSaving) storedData.shownMap.push(map2);
        else storedData.shownMap.push(map1);
    }
    else {
        map1[1] = map2[1] = null;
        if (!isEmptyJson(wCard)) storedData.shownMap.push(map2);
        else storedData.shownMap.push(map1);
    }
}

function isEmptyJson(json){
    if (Object.keys(json).length === 0) return true;
}

function controlPopupCards() {
    var popupCards = $('#popupList .modal-body');
    popupCards.unbind();
    popupCards.on('click', '#popupCard', (e) => {
        var button = $(e.target).parent();
        var index = $(e.currentTarget).index() - 1;
        var data = storedData[storedData.shownMap[index][0]].cards[index];
        if (button.attr('id') === 'remove'){
            button.removeAttr('id'); // avoid repeatedly clicking button that would causes error
            removeData(index);
            $(e.currentTarget).fadeOut(() => {
                $(e.currentTarget).detach();
            });
        } 
        else if (button.attr('id') === 'plus' && storedData.qty[index] < 99) {   
            updatePrice($(e.currentTarget), data, index, 1)
            var btnMinus = $(e.currentTarget).find('#minus');
            if (storedData.qty[index] === 99) button.addClass('disabled');
            else if (btnMinus.hasClass('disabled')) btnMinus.removeClass('disabled');
        }
        else if (button.attr('id') === 'minus' && storedData.qty[index] > 1) {
            updatePrice($(e.currentTarget), data, index, -1)
            var btnPlus = $(e.currentTarget).find('#plus');
            if (storedData.qty[index] === 1) button.addClass('disabled');
            else if (btnPlus.hasClass('disabled')) btnPlus.removeClass('disabled');
        }
        else if (['priceTag', 'up', 'down'].includes(button.attr('id'))) 
            switchCard($(e.currentTarget), index, popupCards);
        else if (button.children().attr('id') === 'uncheck') {
            if ($(e.currentTarget).find('#check').css('display') === 'none'){
                $(e.currentTarget).find('#check').fadeIn();
                $(e.currentTarget).find('#itemDesc').css('text-decoration', 'line-through');
            }
            else {
                $(e.currentTarget).find('#check').fadeOut();
                $(e.currentTarget).find('#itemDesc').css('text-decoration', 'none');
            }
        }
        updateTotalPrice();
    });
}

function removeData(index) {
    storedData.SKUs = storedData.SKUs.filter(e => e !== storedData.Coles.cards[index].itemSKU);
    storedData.SKUs = storedData.SKUs.filter(e => e !== storedData.Woolies.cards[index].itemSKU);
    storedData.Coles.cards.splice(index, 1);
    storedData.Woolies.cards.splice(index, 1);
    storedData.qty.splice(index, 1);
    storedData.shownMap.splice(index, 1);
    $('#navbarNav a#list .badge').text(storedData.shownMap.length);
    if (storedData.shownMap.length === 0) $('#navbarNav a#list .badge').text('');
}

function updatePrice(item, data, index, posOrNeg) {
    storedData.qty[index] += 1 * posOrNeg;
    function updatePriceData(data){
        item.find('#qty').text(storedData.qty[index]);
        if (data.itemPromoQty !== 0){
            var priceDiff = (data.itemCent + data.itemDollar) * data.itemPromoQty - data.itemPromoPrice;
            if (posOrNeg > 0 && storedData.qty[index] % data.itemPromoQty === 0) data.itemPrice -= priceDiff;
            else if (posOrNeg < 0 && (storedData.qty[index] + 1) % data.itemPromoQty === 0)
                data.itemPrice += priceDiff;
        }
        data.itemPrice += (data.itemDollar + data.itemCent) * posOrNeg;
    }
    updatePriceData(data);
    item.find('#price').text('$' + data.itemPrice / 100);
    if (storedData.shownMap[index][1] !== null) {
        var altData = storedData[storedData.shownMap[index][1]].cards[index];
        updatePriceData(altData);
    }
    changePriceFeature(index, item, data);
}

function changePriceFeature(index, item, data) {
    item.find('#price').removeClass('text-success').removeClass('text-danger');
    item.find('#up').hide();
    item.find('#down').hide();
    if (storedData.shownMap[index][1] !== null){
        var altData = storedData[storedData.shownMap[index][1]].cards[index];
        if (data.itemPrice < altData.itemPrice) {
            item.find('#price').addClass('text-success').removeClass('text-danger');
            item.find('#up').show();
            item.find('#down').hide();
        }
        else if (data.itemPrice > altData.itemPrice) {
            item.find('#price').removeClass('text-success').addClass('text-danger');
            item.find('#up').hide();
            item.find('#down').show();
        }
    }
}

function switchCard(card, index, cards) {
    if (storedData.shownMap[index][1] !== null) {
        storedData.shownMap[index].splice(0, 0, storedData.shownMap[index][1]);
        storedData.shownMap[index].pop();
        card.fadeOut(() => {
            cards.children().eq(index).after(createPopupCard(index).fadeIn());
            card.detach();
        });
    }
}

function updateTotalPrice() {
    storedData.totalPrice = 0;
    storedData.totalSaving = 0;
    for (let i = 0; i < storedData.qty.length; i++){
        var item = storedData[storedData.shownMap[i][0]].cards[i];
        storedData.totalPrice += item.itemPrice;
        storedData.totalSaving += item.itemSaving * storedData.qty[i];
        storedData.totalSaving += (item.itemCent + item.itemDollar) * storedData.qty[i] - item.itemPrice;
    }
    $('#popupList #totalPrice').text('Total: $' + (storedData.totalPrice / 100).toFixed(2));
    $('#popupList #totalSaving').text('Total saving: $' + (storedData.totalSaving / 100).toFixed(2));
}