//load progress bar and freeze input group until search ended.
function progressbarLoading() {
    $('#searchInput').prop('disabled', true);
    $('#searchButton').prop('disabled', true);
    $('.progress-bar').css('width', (parseInt($('.progress-bar').attr('aria-valuenow')) + 45) + '%').attr('aria-valuenow', parseInt($('.progress-bar').attr('aria-valuenow')) + 45);
        if ($('.progress-bar').attr('aria-valuenow') === '100') {
            $('.progress').addClass('invisible');
            $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
            $('#searchInput').prop('disabled', false);
            $('#searchButton').prop('disabled', false);
        }
}

window.addEventListener('load', () => {
    $('body').css('padding-top', $('#navBar').height());
    var form = document.querySelector('.needs-validation');
    form.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        // only allow digits, letters and middle white space
        if (!$('#searchInput')[0].value.trim().match(/^[0-9a-zA-Z\s]+$/)) {
            $('.invalid-feedback').fadeIn(() => {
                $('.invalid-feedback').delay(3000).fadeOut();
            });
        }
        else {
            $('#navSearch').collapse('hide');
            $('.progress').removeClass('invisible');
            $('.progress-bar').css('width', '10%').attr('aria-valuenow', 10);
            $('.card').remove('#active_listColes');
            $('.card').remove('#active_listWoolies');
            fetchFromColes();
            fetchFromWoolies();
        }
    }, false);
}, false);

// Coles uses Cookie fingerprint and no API so have to fetch from serverside using Puppeteer
function fetchFromColes() {
    var urlColes = "https://shop.coles.com.au";
    $.ajax({
        type: 'POST',
        url: '/',
        data: {
            "query": $('#searchInput')[0].value.trim(),
            "userAgent": navigator.userAgent
        }
    }).done((data) => {
        progressbarLoading();
        var fromColes = [];
        for (let i = 0; i < data.fromColes.length; i++){
            var item = data.fromColes[i];
            var itemPromoQty = 0, itemPromoPrice = 0;
            if (item.hasOwnProperty("pq")) itemPromoQty = item.pq;
            if (item.hasOwnProperty("pr")) itemPromoPrice = item.pr;
            fromColes.push({
                "itemSKU": item.p,
                "itemImage": item.t,
                "itemBrand": item.m,
                "itemName": item.n,
                "itemDollar": Math.floor(item.p1.o),
                "itemCent": item.p1.o % 1,
                "itemSize": item.a.O3[0],
                "itemPackagePrice": item.u2,
                "itemPromoQty": itemPromoQty,
                "itemPromoPrice": itemPromoPrice,
                "itemSaving": (item.p1.hasOwnProperty("l4")) ? item.p1.l4 - item.p1.o : 0
            });
        }
        console.log(data);
        createList(fromColes, $('#listColes'), urlColes);
    });
}

// Woolies provides API so data can be fetched from clientside
function fetchFromWoolies() {
    var urlWoolies = 'https://www.woolworths.com.au/apis/ui/v2/Search/products?pagesize=36&searchterm=';
    $.ajax({
        type: 'GET',
        url: urlWoolies + $('#searchInput')[0].value.trim(),
    }).done((data) => {
        progressbarLoading();
        var fromWoolies = [];
        for (let i = 0; i < data.Products.length; i++){
            var item = data.Products[i].Products[0];
            var itemPromoQty = 0, itemPromoPrice = 0;
            if (item.Price === null) continue;  // product unavailable
            if (item.CentreTag.TagContent !== null){
                if ($(item.CentreTag.TagContent).attr('title') !== undefined) {
                    if (Number.isInteger(parseInt($(item.CentreTag.TagContent).attr('title').charAt(0)))){
                        itemPromoQty = parseInt($(item.CentreTag.TagContent).attr('title').charAt(0));
                        itemPromoPrice = parseFloat($(item.CentreTag.TagContent).attr('title').split(' ').pop());
                    }
                }
            }
            fromWoolies.push({
                "itemSKU": item.Stockcode,
                "itemImage": item.MediumImageFile,
                "itemBrand": (item.Brand === null) ? '' : item.Brand.charAt(0).toUpperCase() + item.Brand.slice(1),
                "itemName": (item.Brand === null) ? item.Name.trim() : item.Name.slice(item.Brand.length).trim(),
                "itemDollar": Math.floor(item.Price),
                "itemCent": (item.Price % 1),
                "itemSize": item.PackageSize,
                "itemPackagePrice": item.CupString,
                "itemPromoQty": itemPromoQty,
                "itemPromoPrice": itemPromoPrice,
                "itemSaving": item.WasPrice - item.Price
            });
        }
        console.log(fromWoolies);
        createList(fromWoolies, $('#listWoolies'), '');
    });
}

// create search result
function createList(data, cards, url) {
    switch (data.length) {
        case 0:
            break;
        default:
            var card = cards.children().clone();
            var delayTime = 500;
            var altImg = 'https://shop.coles.com.au/wcsstore/ColesResponsiveStorefrontAssetStore/dist/d04b5953359411f41db65cc3fdc06d7d/img/img_product-placeholder.png';
            cards.fadeIn();
            for (let i = 0; i < data.length; i++) {
                card.attr('id', 'active_' + cards.attr('id'));
                card.find('img').attr({
                    'src': url + data[i].itemImage,
                    'alt': data[i].itemBrand + ' ' + data[i].itemName,
                    'onerror': "this.error=null;this.src='" + altImg + "'"
                });
                card.find('#itemDesc').text(data[i].itemBrand + ' ' + data[i].itemName + ' ' + data[i].itemSize);
                card.find('#packagePrice').text(data[i].itemPackagePrice);
                var itemPrice = data[i].itemDollar + data[i].itemCent + data[i].itemSaving;
                card.find('p#wasPrice').hide();
                card.find('#discount').hide();
                card.find('#item-promo').hide();
                if (data[i].itemSaving !== 0) {
                    card.find('p#wasPrice').text('Was $' + itemPrice.toFixed(2));
                    if ($(window).width() >= 992) card.find('p#wasPrice').show();
                    card.find('#discount').text((data[i].itemSaving / itemPrice * 100).toFixed() + '%OFF');
                    card.find('#discount').show();
                }
                else if (data[i].itemPromoQty !== 0) {
                    card.find('p#wasPrice').text('Each for $' + (data[i].itemPromoPrice / data[i].itemPromoQty).toFixed(2));
                    if ($(window).width() >= 992) card.find('p#wasPrice').show();
                    card.find('#item-promo').text(data[i].itemPromoQty + ' for $' + data[i].itemPromoPrice);
                    card.find('#item-promo').show();
                }
                card.find('#dollar').text(data[i].itemDollar);
                card.find('#cent').text((data[i].itemCent === 0) ? '' : (data[i].itemCent * 100).toFixed(0));
                var currentCard = card.clone().delay(delayTime += 100).fadeTo(400, 1);
                cards.append(currentCard);
                textAutoScroll(currentCard);
                titleResponsive(currentCard);
                card.find('#currency').show();
            }
            chooseCards(cards, data);
    }
}

// Auto scroll texts if more than 2 lines
function textAutoScroll(card) {
    var height = card.find('#itemDesc').height();
    var lineHeight = card.find('#itemDesc').css('line-height').split('px')[0];
    if (height / lineHeight > 2){
        card.find('#auto-scroll').css({
            'height': height / (height / lineHeight).toFixed() * 2,
            'overflow-y': 'hidden'
        });
        function infinite(){
            var hiddenHeight = height - lineHeight * 2;
            var hiddenLines = hiddenHeight / lineHeight;
            card.find('#itemDesc').css('margin-top', 0);
            card.find('#itemDesc').animate({marginTop: -hiddenHeight + 'px'}, hiddenLines * 4000, 'linear', () => {
                infinite();
            });
        }
        infinite();
    }
    else if (height / lineHeight <= 1 && $(window).width() < 768)
        card.find('#itemDesc').css('margin-bottom', lineHeight + 'px');
}

function titleResponsive(card) {
    var title = card.find('#cardTitle');
    if (card.attr('id') === 'active_listColes') title.text('Coles').css('background-color', '#de1f27');
    else title.text('Woolworths').css('background-color', '#178841');
    if ($(window).width() >= 768) title.css('writing-mode', 'vertical-rl').addClass('rounded-left');
    else title.css('writing-mode', 'horizontal-tb').addClass('rounded-top');
}

// store all user chosen data here
var storedData = {
    "lastAddedFrom": "",
    "SKUs": [],
    "Coles": {"isAdded": false, "cards": []},
    "Woolies": {"isAdded": false, "cards": []}
};

// create shopping list with animation
function chooseCards(cards, data) {
    cards.unbind(); // It's necessary to unbind all handlers before binding new onclick functions
    cards.on('click', '.card', (e) => {
    var chosenData = data[$(e.currentTarget).index() - 1];
    var cardFrom = $(e.currentTarget).attr('id').split('list')[1];
    storedData.lastAddedFrom = cardFrom;
    if (!storedData[cardFrom].isAdded && $(e.currentTarget).find('#cardMask').css('opacity') === '0'){
        if (storedData.SKUs.includes(chosenData.itemSKU)){
            $('#prompt-1').collapse('hide');
            $('#prompt-2').collapse('hide');
            $('#prompt #promptText').text('You have already chosen this product. Check it on your list :)');
            $('#prompt').collapse('show');
            setTimeout(() => {
                $('#prompt').collapse('hide');
            }, 2000);
            $(e.currentTarget).find('#cardMask').animate({
                'opacity': '0.6'
            }, 500, 'linear');
        }
        else{
            cards.children().not($(e.currentTarget)).find('#cardMask').animate({
                'opacity': '0.6'
            }, 500, 'linear');
            storedData.SKUs.push(chosenData.itemSKU);
            chosenData.cardIndex = $(e.currentTarget).index();
            storedData[cardFrom].cards.push(chosenData);
            storedData[cardFrom].isAdded = true;
            if (storedData.Coles.isAdded && storedData.Woolies.isAdded){
                var lastAddedColes = storedData.Coles.cards[storedData.Coles.cards.length - 1];
                var lastAddedWoolies = storedData.Woolies.cards[storedData.Woolies.cards.length - 1];
                lastAddedColes.pair = lastAddedWoolies.itemSKU;
                lastAddedWoolies.pair = lastAddedColes.itemSKU;
                $('#prompt-1').collapse('hide');
                $('#prompt-2 #promptText').text('Do you want to compare this pair of products?');
                $('#prompt-2').collapse('show');
            }
            else if (storedData[cardFrom].isAdded){
                $('#prompt-1 #promptText').text('Try to find a comparable product from ' + cardFrom + ' :)');
                $('#prompt-1').collapse('show');
            }
        }
    }
    promptControl(); 
        // var chosenCard = $(e.currentTarget).find('img').clone().removeClass('border-0').addClass('rounded-circle chosen-item');

        // addToShoppingListAnimation(chosenCard, e.currentTarget, latestAdded);
    });
}

function promptControl() {
    $('#prompt-1 #btnPass').unbind();
    $('#prompt-1 #btnPass').on('click', () => {
        $('#prompt-1').collapse('hide');
        storeCards();
    });
    $('#prompt-1 #btnRechoose').unbind();
    $('#prompt-1 #btnRechoose').on('click', () => {
        $('#prompt-1').collapse('hide');
        rechooseCards();
    });
    $('#prompt-2 #btnRechoose').unbind();
    $('#prompt-2 #btnRechoose').on('click', () => {
        $('#prompt-2').collapse('hide');
        $('#prompt-1').collapse('show');
        rechooseCards();
    });
    $('#prompt-2 #btnConfirm').unbind();
    $('#prompt-2 #btnConfirm').on('click', () => {
        $('#prompt-2').collapse('hide');
        storeCards();
    });
}

function rechooseCards() {
    $('#list' + storedData.lastAddedFrom).children().find('#cardMask').animate({
        'opacity': '0'
    }, 500, 'linear');
    storedData[storedData.lastAddedFrom].cards.pop();
    storedData.SKUs.pop();
    storedData[storedData.lastAddedFrom].isAdded = false;
    if (storedData.lastAddedFrom === 'Coles' && storedData.Woolies.isAdded) storedData.lastAddedFrom = 'Woolies';
    if (storedData.lastAddedFrom === 'Woolies' && storedData.Coles.isAdded) storedData.lastAddedFrom = 'Coles';
}

function storeCards() {
    $('.card').find('#cardMask').animate({
        'opacity': '0'
    }, 500, 'linear');
    if (storedData.Coles.isAdded && !storedData.Woolies.isAdded) storedData.Woolies.cards.push({});
    else if (!storedData.Coles.isAdded && storedData.Woolies.isAdded) storedData.Coles.cards.push({});
    storedData.Coles.isAdded = false;  // initialize status
    storedData.Woolies.isAdded = false;  // initialize status
    $('#prompt #promptText').text('Products have been successfully added to your list!');
    $('#prompt').collapse('show');
    setTimeout(() => {
        $('#prompt').collapse('hide');
    }, 2000);
    var lastColesCard = storedData.Coles.cards[storedData.Coles.cards.length - 1];
    var lastWooliesCard = storedData.Woolies.cards[storedData.Woolies.cards.length - 1]
    addToListAnimation(lastColesCard, $('#listColes'));
    addToListAnimation(lastWooliesCard, $('#listWoolies'));
    console.log(storedData);
}

function addToListAnimation(lastCard, parent) {
    if (lastCard.hasOwnProperty("cardIndex")){
        var child = parent.children().eq(lastCard.cardIndex);
        var animatedCard = child.clone().offset({
            top: child.offset().top - $(window).scrollTop(),
            left: child.offset().left
        }).css({
            'width': child.width(),
            'height': child.height(),
            'opacity': '1',
            'position': 'absolute',
            'z-index': '10',
            'display': 'block'
        });
        var target = ($(window).width() >= 768) ? $('#navBar a#list') : $('#navBar button#burgerCollapse');
        animatedCard.appendTo(target).animate({
            'top': target.offset().top - $(window).scrollTop(),
            'left': target.offset().left,
            'width': '3px',
            'height': '2px',
            'opacity': '0',
        }, 800, 'swing', () => {
            animatedCard.remove();
        });
        parent.children().eq(lastCard.cardIndex).fadeOut();
    }
}

// function addToShoppingListAnimation (chosenCard, parentList, latestAdded) {
//     $('.item-container:first-child').hide();
//     var container = $('.item-container:first-child').clone().attr('id', 'container-' + latestAdded.order).show();
//     var animated = chosenCard.clone().offset({
//         top: $(parentList).find('img').offset().top,
//         left: $(parentList).find('img').offset().left
//     }).css({
//         'opacity': '0.8',
//         'position': 'absolute',
//         'z-index': '10',
//         'display': 'block'
//     });
//     if (latestAdded.qty <= 1) {
//         container.append(chosenCard).appendTo($('#shopping-list'));
//         //container.animate({ 'height': '7vmax' }, 1000);
//     }
//     var latestContainer = $('#shopping-list').find('#container-' + latestAdded.order);
//     animated.appendTo(latestContainer).animate({
//         'top': $('#shopping-list').offset().top,
//         'left': latestContainer.offset().left,
//         'opacity': 0
//     }, 1000, 'swing');
//     chosenCard.css({
//         'display': 'inline',
//         'opacity': 0
//     }).animate({'opacity': 1}, 1000, () => {
//         latestContainer.find('span#item-qty').text(latestAdded.qty).fadeIn();
//         animated.remove();
//     });
//     // chosenCard.delay(1000).fadeIn(() => {
//     //     latestContainer.find('span#item-qty').text(latestAdded.qty).fadeIn();
//     //     animated.remove();
//     // });
// }