// store all user chosen data here
var storedData = {};

function progressbarLoading() {
    $('.progress-bar').css('width', (parseInt($('.progress-bar').attr('aria-valuenow')) + 45) + '%').attr('aria-valuenow', parseInt($('.progress-bar').attr('aria-valuenow')) + 45);
        if ($('.progress-bar').attr('aria-valuenow') === '100') {
            $('.progress').addClass('invisible');
            $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        }
}

function borderResponsive() {
    if ($(window).width() >= 768) {

    }
}

window.addEventListener('load', () => {
    $('#background').fadeIn();
    // if ($(window).width() <= 1024 && $(window).width() < $(window).height())
    //     $('a.list-group-item').css('width', '100vw');
    // else {
    //     $('a.list-group-item').css('width', '45vw');
    //     $('#search-result').addClass('justify-content-center');
    // }
    var form = document.querySelector('.needs-validation');
    form.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        // only allow digits, letters and middle white space
        if (!$('#query')[0].value.trim().match(/^[0-9a-zA-Z\s]+$/)) {
            $('.invalid-feedback').fadeIn(() => {
                $('.invalid-feedback').delay(3000).fadeOut();
            });
        }
        else {
            $('.progress').removeClass('invisible');
            $('.progress-bar').css('width', '10%').attr('aria-valuenow', 10);
            $('#background').animate( {opacity: 0.3} );
            $('a.list-group-item').remove('.active_listColes');
            $('a.list-group-item').remove('.active_listWoolies');
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
            "query": $('#query')[0].value.trim(),
            "userAgent": navigator.userAgent
        }
    }).done((data) => {
        progressbarLoading();
        console.log(data);
        createList(data.fromColes, $('#listColes'), urlColes);
    });
}

// Woolies provides API so data can be fetched from clientside
function fetchFromWoolies() {
    var urlWoolies = 'https://www.woolworths.com.au/apis/ui/v2/Search/products?pagesize=36&searchterm=';
    $.ajax({
        type: 'GET',
        url: urlWoolies + $('#query')[0].value.trim(),
    }).done((data) => {
        progressbarLoading();
        var fromWoolies = [];
        for (let i = 0; i < data.Products.length; i++){
            var item = data.Products[i].Products[0];
            var itemPromoQty = 0;
            var itemPromoPrice = 0;
            if (item.Price === null) continue;  // product unavailable
            if (item.CentreTag.TagContent !== null){
                if ($(item.CentreTag.TagContent).attr('title') !== undefined) {
                    itemPromoQty = parseInt($(item.CentreTag.TagContent).attr('title').charAt(0));
                    itemPromoPrice = parseFloat($(item.CentreTag.TagContent).attr('title').split(' ').pop());
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
            // if (cards.attr('id') === 'listColes') card.find('#list-item').addClass('gradient-coles');
            // else card.find('#list-item').addClass('gradient-ww flex-row-reverse');
            var delayTime = 500;
            cards.fadeIn();
            for (let i = 0; i < data.length; i++) {
                card.addClass('active_' + cards.attr('id'));
                card.find('img').attr({
                    'src': url + data[i].itemImage,
                    'alt': data[i].itemBrand + ' ' + data[i].itemName
                });
                card.find('#itemDesc').text(data[i].itemBrand + ' ' + data[i].itemName + ' ' + data[i].itemSize);
                card.find('#packagePrice').text(data[i].itemPackagePrice);
                if (data[i].itemSaving !== 0) {
                    card.find('h5#item-saving').show();
                    card.find('b#item-saving').text('You will save $' + data[i].itemSaving.toFixed(2) + '!');
                }
                else card.find('h5#item-saving').hide();
                if (data[i].itemPromoQty !== 0) {
                    card.find('h5#item-promo').show();
                    card.find('b#item-promo').text('You will save $' + (((data[i].itemDollar + data[i].itemCent) * data[i].itemPromoQty) - data[i].itemPromoPrice) + ' if you buy ' + data[i].itemPromoQty + '!');
                }
                else card.find('h5#item-promo').hide();
                card.find('#dollar').text(data[i].itemDollar);
                card.find('#cent').text((data[i].itemCent === 0) ? '' : (data[i].itemCent * 100).toFixed(0));
                var currentCard = card.clone().delay(delayTime += 100).fadeTo(400, 1);
                cards.append(currentCard);
                textAutoScroll(currentCard);
                card.find('#currency').show();
            }
            addToShoppingList(cards, data);
    }
}

// Auto scroll texts if more than 2 lines
function textAutoScroll(card) {
    var height = card.find('#itemDesc').height();
    var lineHeight = card.find('#itemDesc').css('line-height').split('px')[0];
    if (height / lineHeight > 2){
        card.find('#auto-scroll').css({
            'height': lineHeight * 2,
            'overflow-y': 'hidden'
        });
        function infinite(){
            var hiddenLines = (height / lineHeight).toFixed() - 2;
            card.find('#itemDesc').css('margin-top', 0);
            card.find('#itemDesc').animate({marginTop: hiddenLines * -lineHeight + 'px'}, hiddenLines * 4000, 'linear', () => {
                infinite();
            });
        }
        infinite();
    }
}

// create shopping list with animation
function addToShoppingList(cards, data) {
    cards.unbind(); // It's necessary to unbind all handlers before binding new onclick functions
    cards.on('click', '.card', (e) => {
        var chosenItem = $(e.currentTarget).find('img').clone().removeClass('border-0').addClass('rounded-circle chosen-item');
        var chosenData = data[$('.active_' + cards.attr('id')).index($(e.currentTarget))];
        var vendorCode = '';
        if (cards.attr('id') === 'listColes') {
            chosenItem.css('box-shadow', 'inset 0 0 0 2vmax #de1f27');
            vendorCode = 'co'; // Coles
        }
        else {
            chosenItem.css('box-shadow', 'inset 0 0 0 2vmax #178841');
            vendorCode = 'ww'; // Woolies
        }
        var latestAdded = storeChosenItems(chosenData, vendorCode);
        addToShoppingListAnimation(chosenItem, e.currentTarget, latestAdded);
    });
}

// store user-chosen items data and return json
function storeChosenItems(data, from) {
    if (storedData.hasOwnProperty(data.itemSKU)) storedData[data.itemSKU].qty++;
    else {
        storedData[data.itemSKU] = data;
        storedData[data.itemSKU].qty = 1;
        storedData[data.itemSKU].vendorCode = from;
        storedData[data.itemSKU].order = Object.keys(storedData).length++;
    }
    return storedData[data.itemSKU];
}

function addToShoppingListAnimation (chosenItem, parentList, latestAdded) {
    $('.item-container:first-child').hide();
    var container = $('.item-container:first-child').clone().attr('id', 'container-' + latestAdded.order).show();
    var animated = chosenItem.clone().offset({
        top: $(parentList).find('img').offset().top,
        left: $(parentList).find('img').offset().left
    }).css({
        'opacity': '0.8',
        'position': 'absolute',
        'z-index': '10',
        'display': 'block'
    });
    if (latestAdded.qty <= 1) {
        container.append(chosenItem).appendTo($('#shopping-list'));
        //container.animate({ 'height': '7vmax' }, 1000);
    }
    var latestContainer = $('#shopping-list').find('#container-' + latestAdded.order);
    animated.appendTo(latestContainer).animate({
        'top': $('#shopping-list').offset().top,
        'left': latestContainer.offset().left,
        'opacity': 0
    }, 1000, 'swing');
    chosenItem.css({
        'display': 'inline',
        'opacity': 0
    }).animate({'opacity': 1}, 1000, () => {
        latestContainer.find('span#item-qty').text(latestAdded.qty).fadeIn();
        animated.remove();
    });
    // chosenItem.delay(1000).fadeIn(() => {
    //     latestContainer.find('span#item-qty').text(latestAdded.qty).fadeIn();
    //     animated.remove();
    // });
}