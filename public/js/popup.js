window.addEventListener('load', () => {
    $('#navbarNav a#list').on('click', () => {
        $('#navSearch, #navbarNav').collapse('hide');
        storedData.shownMap = []; // can be removed
        storedData.totalPrice = 0; // can be removed
        storedData.totalSaving = 0; // can be removed
        console.log(storedData);
        createPopupList();
    });
}, false);

function createPopupList() {
    $('#popupList #popupCard').remove('.active');
    if (storedData.SKUs.length > 0){
        var popupCard = $('#popupList #popupCard').clone();
        var altImg = 'https://shop.coles.com.au/wcsstore/ColesResponsiveStorefrontAssetStore/dist/d04b5953359411f41db65cc3fdc06d7d/img/img_product-placeholder.png';
        for (let i = 0; i < storedData.qty.length; i++){
            getLowerPrice(i);
            var data = storedData[storedData.shownMap[i][0]].cards[i];
            // storedData.totalPrice += data.itemPrice;
            // storedData.totalSaving += data.itemSaving;
            popupCard.addClass('active');
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
                popupCard.find('#discount').text((data.itemSaving / data.itemPrice * 100).toFixed() + '%OFF');
                popupCard.find('#discount').show();
            }
            else if (data.itemPromoQty !== 0) {
                popupCard.find('#promo').text(data.itemPromoQty + ' for $' + data.itemPromoPrice);
                popupCard.find('#promo').show();
            }
            popupCard.find('#price').text('$' + data.itemPrice);
            popupCard.find('#qty').text(storedData.qty[i]);
            $('#popupList .modal-body').append(popupCard.clone().fadeIn());
            controlPopupCards();
        }
        updateTotalPrice();
    }
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
        console.log(index);
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
        else{
            if ($(e.currentTarget).find('#check').css('display') === 'none')
                $(e.currentTarget).find('#check').fadeIn();
            else $(e.currentTarget).find('#check').fadeOut();
        }
        updateTotalPrice();
    })
}

function removeData(index) {
    storedData.SKUs = storedData.SKUs.filter(e => e !== storedData.Coles.cards[index].itemSKU);
    storedData.SKUs = storedData.SKUs.filter(e => e !== storedData.Woolies.cards[index].itemSKU);
    storedData.Coles.cards.splice(index, 1);
    storedData.Woolies.cards.splice(index, 1);
    storedData.qty.splice(index, 1);
    storedData.shownMap.splice(index, 1);
    console.log(storedData);
}

function updatePrice(item, data, index, posOrNeg) {
    storedData.qty[index] += 1 * posOrNeg;
    item.find('#qty').text(storedData.qty[index]);
    if (data.itemPromoQty !== 0){
        var priceDiff = (data.itemCent + data.itemDollar) * data.itemPromoQty - data.itemPromoPrice;
        console.log(priceDiff);
        if (posOrNeg > 0 && storedData.qty[index] % data.itemPromoQty === 0) data.itemPrice -= priceDiff;
        else if (posOrNeg < 0 && (storedData.qty[index] + 1) % data.itemPromoQty === 0)
            data.itemPrice += priceDiff;
    }
    data.itemPrice += (data.itemDollar + data.itemCent) * posOrNeg;
    item.find('#price').text('$' + data.itemPrice);
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
    $('#popupList #totalPrice').text('Total: $' + storedData.totalPrice);
    $('#popupList #totalSaving').text('Total saving: $' + storedData.totalSaving);
}



storedData = JSON.parse(`{"lastAddedFrom":"Woolies","qty":[1,1,1,1,1,1,1,1,1,1],"SKUs":[70288,"2529470P",809874,446476,"7580190P","3569414P",372519,"3034348P",764321,"3569403P",764264,"3569458P",83730,"2725456P",83734,"3768374P",892475],"Coles":{"isAdded":false,"cards":[{},{"itemSKU":"2529470P","itemImage":"/wcsstore/Coles-CAS/images/2/5/2/2529470-th.jpg","itemBrand":"Coles","itemName":"Gluten Free Graze Grass Fed Oregano & Fresh Parsley Beef Burgers","itemDollar":9,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$1.80 per 100G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":29,"itemPrice":9,"itemVendor":"co","itemQty":1,"pair":809874},{"itemSKU":"7580190P","itemImage":"/wcsstore/Coles-CAS/images/7/5/8/7580190-th.jpg","itemBrand":"Coles","itemName":"Thin Beef BBQ Sausages 8 pack","itemDollar":5,"itemCent":0,"itemSize":"560g","itemPackagePrice":"$8.93 per 1Kg","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":21,"itemPrice":5,"itemVendor":"co","itemQty":1,"pair":446476},{"itemSKU":"3569414P","itemImage":"/wcsstore/Coles-CAS/images/3/5/6/3569414-th.jpg","itemBrand":"Coles","itemName":"Black Bean & Spicy Jalapeno Beef & Pork Burgers 4 Pack","itemDollar":8,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$16.00 per 1Kg","itemPromoQty":"2","itemPromoPrice":12,"itemSaving":0,"cardIndex":17,"itemPrice":8,"itemVendor":"co","itemQty":1,"pair":372519},{"itemSKU":"3034348P","itemImage":"/wcsstore/Coles-CAS/images/3/0/3/3034348-th.jpg","itemBrand":"Coles","itemName":"Beef Thyme And Parsley Burgers","itemDollar":7,"itemCent":0.5,"itemSize":"500g","itemPackagePrice":"$15.00 per 1Kg","itemPromoQty":"2","itemPromoPrice":12,"itemSaving":0,"cardIndex":24,"itemPrice":7.5,"itemVendor":"co","itemQty":1,"pair":764321},{"itemSKU":"3569403P","itemImage":"/wcsstore/Coles-CAS/images/3/5/6/3569403-th.jpg","itemBrand":"Coles","itemName":"Cheese Stuffed Beef Burger","itemDollar":8,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$1.60 per 100G","itemPromoQty":"2","itemPromoPrice":12,"itemSaving":0,"cardIndex":8,"itemPrice":8,"itemVendor":"co","itemQty":1,"pair":764264},{"itemSKU":"3569458P","itemImage":"/wcsstore/Coles-CAS/images/3/5/6/3569458-th.jpg","itemBrand":"Coles","itemName":"Parmesan Cheese & Tomato Beef Meatballs","itemDollar":8,"itemCent":0,"itemSize":"420g","itemPackagePrice":"$1.90 per 100G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":5,"itemPrice":8,"itemVendor":"co","itemQty":1,"pair":83730},{"itemSKU":"2725456P","itemImage":"/wcsstore/Coles-CAS/images/2/7/2/2725456-th.jpg","itemBrand":"Coles","itemName":"Graze Grass fed Beef Meatballs","itemDollar":6,"itemCent":0.5,"itemSize":"420g","itemPackagePrice":"$15.48 per 1Kg","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":7,"itemPrice":6.5,"itemVendor":"co","itemQty":1},{},{"itemSKU":"3768374P","itemImage":"/wcsstore/Coles-CAS/images/3/7/6/3768374-th.jpg","itemBrand":"Primo","itemName":"Beef & Pork Chorizo Sausage","itemDollar":7,"itemCent":0,"itemSize":"450g","itemPackagePrice":"$15.56 per 1Kg","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":4,"itemPrice":7,"itemVendor":"co","itemQty":1,"pair":892475}],"totalPrice":59,"totalSaving":0},"Woolies":{"isAdded":false,"cards":[{"itemSKU":70288,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/070288.jpg","itemBrand":"Hoyt's","itemName":"Garlic Granules","itemDollar":1,"itemCent":0.75,"itemSize":"40g","itemPackagePrice":"$0.44 / 10G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":31,"itemPrice":1.75,"itemVendor":"ww","itemQty":1},{"itemSKU":809874,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/809874.jpg","itemBrand":"Leggos","itemName":"Italian Style Sausage Agnolotti","itemDollar":8,"itemCent":0,"itemSize":"630g","itemPackagePrice":"$1.27 / 100G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":29,"itemPrice":8,"itemVendor":"ww","itemQty":1,"pair":"2529470P"},{"itemSKU":446476,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/446476.jpg","itemBrand":"Maggi","itemName":"Devilled Sausages Recipe Base","itemDollar":1,"itemCent":0.75,"itemSize":"37g","itemPackagePrice":"$4.73 / 100G","itemPromoQty":2,"itemPromoPrice":3,"itemSaving":0,"cardIndex":32,"itemPrice":1.75,"itemVendor":"ww","itemQty":1,"pair":"7580190P"},{"itemSKU":372519,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/372519.jpg","itemBrand":"Sargents","itemName":"Premium Pies Angus Beef Family","itemDollar":6,"itemCent":0,"itemSize":"550g","itemPackagePrice":"$1.09 / 100G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":2,"cardIndex":13,"itemPrice":6,"itemVendor":"ww","itemQty":1,"pair":"3569414P"},{"itemSKU":764321,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/764321.jpg","itemBrand":"Woolworths","itemName":"Homestyle Beef Burger","itemDollar":7,"itemCent":0,"itemSize":"500g 4pk","itemPackagePrice":"$14.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":9,"itemPrice":7,"itemVendor":"ww","itemQty":1,"pair":"3034348P"},{"itemSKU":764264,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/764264.jpg","itemBrand":"Woolworths","itemName":"Beef & Lamb Meatballs","itemDollar":6,"itemCent":0,"itemSize":"400g","itemPackagePrice":"$15.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":1.5,"cardIndex":10,"itemPrice":6,"itemVendor":"ww","itemQty":1,"pair":"3569403P"},{"itemSKU":83730,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/083730.jpg","itemBrand":"Woolworths","itemName":"Caramelised Onion & Angus Beef Sausages","itemDollar":7,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$14.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":1,"cardIndex":5,"itemPrice":7,"itemVendor":"ww","itemQty":1,"pair":"3569458P"},{},{"itemSKU":83734,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/083734.jpg","itemBrand":"Woolworths","itemName":"Smokey Chipotle Chilli Angus Beef Sausages","itemDollar":7,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$14.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":1,"cardIndex":6,"itemPrice":7,"itemVendor":"ww","itemQty":1},{"itemSKU":892475,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/892475.jpg","itemBrand":"Cleaver's","itemName":"Organic Paleo Beef Sausages","itemDollar":9,"itemCent":0.5,"itemSize":"450g","itemPackagePrice":"$21.11 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":4,"itemPrice":9.5,"itemVendor":"ww","itemQty":1,"pair":"3768374P"}],"totalPrice":54,"totalSaving":5.5}}`);