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
                listItem.find('img').attr('src', url + data[i].itemImage);
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
                listItem.find('#cent').text((data[i].itemCent === 0) ? '' : data[i].itemCent * 100);
                listgroup.append(listItem.clone().delay(delayTime += 100).fadeTo(400, 1));
            }
            return listgroup;
    }   
    console.log(listgroup.html());
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

