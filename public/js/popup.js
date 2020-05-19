window.addEventListener('load', () => {
    $('#navbarNav a#list').on('click', () => {
        $('#navSearch, #navbarNav').collapse('hide');
        console.log(storedData);
        createPopupList();
    });
}, false);

function createPopupList() {
    if (storedData.SKUs.length > 0){
        var popupCard = $('#popupList #popupCard').clone();
        var altImg = 'https://shop.coles.com.au/wcsstore/ColesResponsiveStorefrontAssetStore/dist/d04b5953359411f41db65cc3fdc06d7d/img/img_product-placeholder.png';
        for (let i = 0; i < storedData.Coles.cards.length; i++){
            var data = getLowerPrice(i);
            console.log();
            popupCard.addClass('active ' + data.itemVendor);
            if (data.itemVendor === 'co')
                popupCard.find('#title').text('Coles').css('background-color', '#de1f27');
            else popupCard.find('#title').text('Woolworths').css('background-color', '#178841');
            var url = (data.itemVendor === 'co') ? 'https://shop.coles.com.au' : '';
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
            $('#popupList .modal-body').append(popupCard.clone().fadeIn());
        }
    }
}

function getLowerPrice(index) {
    var cCard = storedData.Coles.cards[index];
    var wCard = storedData.Woolies.cards[index];
    if (!isEmptyJson(cCard) && !isEmptyJson(wCard)){
        if (cCard.itemPrice > wCard.itemPrice) return wCard;
        else if (cCard.itemPrice < wCard.itemPrice) return cCard;
        else return (storedData.Coles.totalSaving > storedData.Woolies.totalSaving) ? cCard : wCard;
    }
    else if (!isEmptyJson(cCard)) return cCard;
    else return wCard;
}

function isEmptyJson(json){
    if (Object.keys(json).length === 0) return true;
}


storedData = JSON.parse('{"lastAddedFrom":"Woolies","SKUs":[693435,"3496343P",34021,820196,"3699555P","3700166P","3768363P","3768374P","3577650P",49312,"3569232P",805953,"8219781P",328005,330007,"3270012P",789962,"1028184P","7345893P",30748],"Coles":{"isAdded":false,"cards":[{"itemSKU":"3496343P","itemImage":"/wcsstore/Coles-CAS/images/3/4/9/3496343-th.jpg","itemBrand":"The British Sausage Co.","itemName":"Premium Angus Beef & Caramelised Onion Sausages 6 pack","itemDollar":7,"itemCent":0.5,"itemSize":"450g","itemPackagePrice":"$16.67 per 1Kg","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0,"cardIndex":2,"itemPrice":7.5,"itemVendor":"co","pair":693435},{},{"itemSKU":"3699555P","itemImage":"/wcsstore/Coles-CAS/images/3/6/9/3699555-th.jpg","itemBrand":"Coles","itemName":"Classic Beef Sausages 8 Pack","itemDollar":5,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$1.00 per 100G","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0,"cardIndex":9,"itemPrice":5,"itemVendor":"co","pair":820196},{"itemSKU":"3700166P","itemImage":"/wcsstore/Coles-CAS/images/3/7/0/3700166-th.jpg","itemBrand":"Coles","itemName":"Chicken Sage & Thyme Sausages","itemDollar":5,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$1.00 per 100G","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0,"cardIndex":8,"itemPrice":5,"itemVendor":"co"},{"itemSKU":"3768363P","itemImage":"/wcsstore/Coles-CAS/images/3/7/6/3768363-th.jpg","itemBrand":"Primo","itemName":"Spicy Relish Beef Sausage","itemDollar":5,"itemCent":0.5,"itemSize":"450g","itemPackagePrice":"$12.22 per 1Kg","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":1.5,"cardIndex":4,"itemPrice":5.5,"itemVendor":"co"},{"itemSKU":"3768374P","itemImage":"/wcsstore/Coles-CAS/images/3/7/6/3768374-th.jpg","itemBrand":"Primo","itemName":"Beef & Pork Chorizo Sausage","itemDollar":5,"itemCent":0.5,"itemSize":"450g","itemPackagePrice":"$12.22 per 1Kg","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":1.5,"cardIndex":5,"itemPrice":5.5,"itemVendor":"co"},{"itemSKU":"3577650P","itemImage":"/wcsstore/Coles-CAS/images/3/5/7/3577650-th.jpg","itemBrand":"Coles","itemName":"Thin Beef BBQ Sausages 24 Pack","itemDollar":9,"itemCent":0,"itemSize":"1.8kg","itemPackagePrice":"$5.00 per 1Kg","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0.5,"cardIndex":28,"itemPrice":9,"itemVendor":"co","pair":49312},{"itemSKU":"3569232P","itemImage":"/wcsstore/Coles-CAS/images/3/5/6/3569232-th.jpg","itemBrand":"Coles","itemName":"Thin BBQ Pork Sausages","itemDollar":5,"itemCent":0,"itemSize":"560g","itemPackagePrice":"$0.89 per 100G","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0,"cardIndex":22,"itemPrice":5,"itemVendor":"co","pair":805953},{"itemSKU":"8219781P","itemImage":"/wcsstore/Coles-CAS/images/8/2/1/8219781-th.jpg","itemBrand":"Coles Finest","itemName":"Angus Beef Blended With Herbs & Spices Sausages","itemDollar":7,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$1.40 per 100G","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":1.5,"cardIndex":30,"itemPrice":7,"itemVendor":"co","pair":328005},{},{"itemSKU":"3270012P","itemImage":"/wcsstore/Coles-CAS/images/3/2/7/3270012-th.jpg","itemBrand":"Coles","itemName":"Original Posh Dogs","itemDollar":5,"itemCent":0.5,"itemSize":"300g","itemPackagePrice":"$18.33 per 1Kg","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0,"cardIndex":34,"itemPrice":5.5,"itemVendor":"co","pair":789962},{"itemSKU":"1028184P","itemImage":"/wcsstore/Coles-CAS/images/1/0/2/1028184-th.jpg","itemBrand":"Primo","itemName":"Gluten Free Thin Franks","itemDollar":3,"itemCent":0.1499999999999999,"itemSize":"500g","itemPackagePrice":"$6.30 per 1Kg","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":0,"cardIndex":37,"itemPrice":3.15,"itemVendor":"co"},{"itemSKU":"7345893P","itemImage":"/wcsstore/Coles-CAS/images/7/3/4/7345893-th.jpg","itemBrand":"Coles Finest","itemName":"Pork Sausages Blended With Cider & Apple","itemDollar":7,"itemCent":0,"itemSize":"500g","itemPackagePrice":"$1.40 per 100G","itemPromoQty":0,"itemPromoPrice":"0.00","itemSaving":1.5,"cardIndex":18,"itemPrice":7,"itemVendor":"co","pair":30748}],"totalPrice":65.15,"totalSaving":6.5},"Woolies":{"isAdded":false,"cards":[{"itemSKU":693435,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/693435.jpg","itemBrand":"The british sausage co","itemName":"Raw Smoked Rindless Back Bacon","itemDollar":7,"itemCent":0,"itemSize":"200g","itemPackagePrice":"$35.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":1,"itemPrice":7,"itemVendor":"ww","pair":"3496343P"},{"itemSKU":34021,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/034021.jpg","itemBrand":"Harvest","itemName":"Sausages Vegetables","itemDollar":4,"itemCent":0,"itemSize":"425g","itemPackagePrice":"$9.41 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":2,"itemPrice":4,"itemVendor":"ww"},{"itemSKU":820196,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/820196.jpg","itemBrand":"Woolworths","itemName":"Beef Sausage","itemDollar":5,"itemCent":0.5,"itemSize":"600g","itemPackagePrice":"$9.17 / 1KG","itemPromoQty":2,"itemPromoPrice":10,"itemSaving":0,"cardIndex":5,"itemPrice":5.5,"itemVendor":"ww","pair":"3699555P"},{},{},{},{"itemSKU":49312,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/049312.jpg","itemBrand":"Don","itemName":"Kabana","itemDollar":8,"itemCent":0.5,"itemSize":"375g","itemPackagePrice":"$22.67 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":22,"itemPrice":8.5,"itemVendor":"ww","pair":"3577650P"},{"itemSKU":805953,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/805953.jpg","itemBrand":"Primo","itemName":"White Hungarian Salami","itemDollar":8,"itemCent":0,"itemSize":"200g","itemPackagePrice":"$40.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":21,"itemPrice":8,"itemVendor":"ww","pair":"3569232P"},{"itemSKU":328005,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/328005.jpg","itemBrand":"Primo","itemName":"Chorizo 2 Pack","itemDollar":7,"itemCent":0,"itemSize":"250g","itemPackagePrice":"$28.00 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":28,"itemPrice":7,"itemVendor":"ww","pair":"8219781P"},{"itemSKU":330007,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/330007.jpg","itemBrand":"Sargents","itemName":"Traditional Curry Meat Pies","itemDollar":5,"itemCent":0.5,"itemSize":"700g","itemPackagePrice":"$0.79 / 100G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":30,"itemPrice":5.5,"itemVendor":"ww"},{"itemSKU":789962,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/789962.jpg","itemBrand":"Don","itemName":"Footy Frankfurts Skinless","itemDollar":6,"itemCent":0.20000000000000018,"itemSize":"600g","itemPackagePrice":"$10.33 / 1KG","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":1,"cardIndex":33,"itemPrice":6.2,"itemVendor":"ww","pair":"3270012P"},{},{"itemSKU":30748,"itemImage":"https://cdn0.woolworths.media/content/wowproductimages/medium/030748.jpg","itemBrand":"Patties","itemName":"Sausage Roll Party","itemDollar":8,"itemCent":0.5,"itemSize":"450g","itemPackagePrice":"$1.89 / 100G","itemPromoQty":0,"itemPromoPrice":0,"itemSaving":0,"cardIndex":15,"itemPrice":8.5,"itemVendor":"ww","pair":"7345893P"}],"totalPrice":60.2,"totalSaving":1}}');