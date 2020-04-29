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
            createList(data.fromColes, listColes, urlColes, input.value.trim());
        });
    }
}

// create search result
function createList(data, listgroup, url, itemId) {
    switch (data.length) {
        case 0:
            break;
        default:
            itemId = itemId.replace(/\s/g, '-');
            var listItem = listgroup.children().clone();
            var delayTime = 500;
            listgroup.fadeIn();
            for (var i = 0; i < data.length; i++) {
                listItem.attr('id', itemId + '-' + i);
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
            addToShoppingList(listgroup);
            return listgroup;
    }
}

// save user-chosen items data and return json
function chosenItems(data, from) {
    var existingData = sessionStorage.getItem(from);
    sessionStorage.setItem(from, (existingData === null) ? data : existingData + ',' + data);
}

// create shopping list with animation
function addToShoppingList(listgroup) {
    listgroup.on('click', 'a.list-group-item', (e) => {
        var shoppingList = $('#shopping-list');
        var container = $('<div></div>').addClass('shadow-n rounded-circle border-0 m-1 item-container');
        var chosenItem = $(e.currentTarget).find('img').clone().removeClass('border-0').addClass('rounded-circle chosen-item');
        if (listgroup.attr('id') === 'listColes') chosenItem.css('box-shadow', 'inset 0 0 0 2vmax #de1f27');
        else chosenItem.css('box-shadow', 'inset 0 0 0 2vmax #178841');
        var animated = chosenItem.clone().offset({
            top: $(e.currentTarget).find('img').offset().top,
            left: $(e.currentTarget).find('img').offset().left
        }).css({
            'opacity': '0.8',
            'position': 'absolute',
            'z-index': '100',
            'display': 'block'
        });
        //if ()
        shoppingList.append(container.append(chosenItem));
        animated.appendTo(container).animate({
            'top': container.offset().top,
            'left': container.offset().left,
            'opacity': 0
        }, 1000, 'swing');
        chosenItem.delay(1000).fadeIn();
        container.animate({ 'height': '7vmax'}, 1000);
    });
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