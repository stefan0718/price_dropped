function postData() {  
    var input = document.getElementById('query');
    // only allow digits, letters and middle white space
    if (!input.value.trim().match(/^[0-9a-zA-Z\s]+$/)) {
        $('.invalid-feedback').fadeIn();
    }
    else {
        $('.invalid-feedback').fadeOut();
        $('#background').animate( {opacity: 0.3} );
        $('.loading').fadeIn();
        $.ajax({
            type: 'POST',
            url: '/',
            data: {
                "query": input.value.trim(),
                "userAgent": navigator.userAgent
            }
        }).done((data) => {
            $('.loading').fadeOut();
            var listColes = $('#listColes');
            var urlColes = "https://shop.coles.com.au";
            var listWoolworths = $('#listWoolworths');
            console.log(data);
            createList(data.fromColes, listColes, urlColes);
        });
    }
}

// create search result
function createList(data, listgroup, url) {
    switch (data.length) {
        case 0:
            break;
        default:
            var listItem = listgroup.children().clone();
            var delayTime = 500;
            listgroup.fadeIn();
            for (var i = 0; i < data.length; i++) {
                listItem.addClass('activeListItem');
                listItem.find('img').attr({
                    'src': url + data[i].itemImage,
                    'alt': data[i].itemBrand + ' ' + data[i].itemName
                });
                listItem.find('#item-name-size').text(data[i].itemBrand + ' ' + data[i].itemName + ' ' + data[i].itemSize);
                listItem.find('small').text(data[i].itemPackagePrice);
                if (data[i].itemSaving !== 0) {
                    listItem.find('h5#item-saving').show();
                    listItem.find('b#item-saving').text('You will save $' + data[i].itemSaving + '!');
                }
                else listItem.find('h5#item-saving').hide();
                if (data[i].itemPromoQty !== 0) {
                    listItem.find('h5#item-promo').show();
                    listItem.find('b#item-promo').text('You will save $' + (((data[i].itemDollar + data[i].itemCent) * data[i].itemPromoQty) - data[i].itemPromoPrice) + ' if you buy ' + data[i].itemPromoQty + '!');
                }
                else listItem.find('h5#item-promo').hide();
                listItem.find('b#dollar').text(data[i].itemDollar);
                listItem.find('#cent').text((data[i].itemCent === 0) ? '' : (data[i].itemCent * 100).toFixed(0));
                listgroup.append(listItem.clone().delay(delayTime += 100).fadeTo(400, 1));
            }
            addToShoppingList(listgroup, data);
            return listgroup;
    }
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

// create shopping list with animation
function addToShoppingList(listgroup, data) {
    listgroup.on('click', 'a.list-group-item', (e) => {
        var chosenItem = $(e.currentTarget).find('img').clone().removeClass('border-0').addClass('rounded-circle chosen-item');
        var chosenData = data[$('.activeListItem').index($(e.currentTarget))];
        var vendorCode = '';
        if (listgroup.attr('id') === 'listColes') {
            chosenItem.css('box-shadow', 'inset 0 0 0 2vmax #de1f27');
            vendorCode = 'co'; // Coles
        }
        else {
            chosenItem.css('box-shadow', 'inset 0 0 0 2vmax #178841');
            vendorCode = 'ww'; // Woolworths
        }
        var latestAdded = storeChosenItems(chosenData, vendorCode);
        addToShoppingListAnimation(chosenItem, e.currentTarget, latestAdded);
    });
}

function addToShoppingListAnimation (chosenItem, parentList, latestAdded) {
    var shoppingList = $('#shopping-list');
    var container = $('<div></div>').addClass('shadow-n rounded-circle border-0 m-1 item-container').attr('id', 'container-' + latestAdded.order);
    var animated = chosenItem.clone().offset({
        top: $(parentList).find('img').offset().top,
        left: $(parentList).find('img').offset().left
    }).css({
        'opacity': '0.8',
        'position': 'absolute',
        'z-index': '100',
        'display': 'block'
    });
    if (latestAdded.qty <= 1) {
        shoppingList.append(container.append(chosenItem));
        container.animate({ 'height': '7vmax'}, 1000);
    }
    var latestContainer = shoppingList.find('#container-' + latestAdded.order);
    console.log(latestAdded.order);
    animated.appendTo(latestContainer).animate({
        'top': latestContainer.offset().top,
        'left': latestContainer.offset().left,
        'opacity': 0
    }, 1000, 'swing');
    chosenItem.delay(1000).fadeIn();
}

window.addEventListener('load', () => {
    $('#background').fadeIn();
    $('#searchBar').fadeIn();
    var form = document.querySelector('.needs-validation');
    form.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        postData();
    }, false);
}, false);

// store all user chosen data here
var storedData = {};