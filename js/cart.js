'use strict';

class Cart {
    cartId;
    token;

    payStationStyle = {
        width: '740px',
        height: '700px',
        spinner: 'round'
    }

    setToken(token) {
        this.token = token;
    }

    createCart() {
        this.cartId = 208;
        return;
        var obj = this;
        $.post({
            url: 'https://store.xsolla.com/api/v1/cart',
            headers: {
                'Authorization': 'Bearer ' + this.token
            },
            success: function (data) {
                obj.cartId = data.id;
            }
        });
    }

    removeItemFromCart(sku) {
        var obj = this;
        $.ajax(
            {
                url: 'https://store.xsolla.com/api/v1/cart/'+obj.cartId+'/item/' + sku,
                method: 'DELETE',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                success: function (data) {
                    obj.getCart();
                    M.toast({html: 'Item successfully removed  from cart!'});

                }
            }
        )

    }

    addToCart(sku) {
        var obj = this;
        $.ajax(
            {
                url: 'https://store.xsolla.com/api/v1/cart/'+obj.cartId+'/item/' + sku,
                method: 'PUT',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                data: JSON.stringify({
                    quantity: 1
                }),
                success: function (data) {
                    M.toast({html: 'Item successfully added to cart!'});
                    $('#cart-button').addClass('pulse');
                    obj.getCart();
                }
            }
        )
    }

    buyCart() {
        var obj = this;
        $('.overlay').show();
        $.post({
            url: 'https://store.xsolla.com/api/v1/payment/cart/' + obj.cartId,
            dataType: 'json',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            },
            success: function (data) {
                $('.overlay').hide();
                obj.openPayStation(data.token);
            }
        });
    }

    getCart(){
        var obj = this;
        $.get({
            url: 'https://store.xsolla.com/api/v1/cart/' + obj.cartId,
            dataType: 'json',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            },
            success: function (data) {
                var cartPrice = obj.getPrice(data);
                var counter = obj.getCountItems(data);

                var html = '<h6>' + counter + ' items</h6>';
                html += '<h6>' +
                        '<span style="text-decoration: line-through;">' + cartPrice.currency + cartPrice.amountWithoutDiscount +'</span>' +
                        '<span style="font-size:1.1em"> ' + cartPrice.currency + cartPrice.amount +'</span>' +
                    '</h6>';
                $('#cart-counter').html(html);
            }
        });
    }

    quickBuy(sku) {
        var obj = this;
        $('.overlay').show();
        $.post(
            {
                'url': 'https://store.xsolla.com/api/v1/payment/item/' + sku,
                dataType: 'json',
                'headers': {
                    'Authorization': 'Bearer ' + this.token
                },
                'success': function (data) {
                    obj.openPayStation(data.token);
                    $('.overlay').hide();
                }
            }
        )
    }

    openPayStation(token){
        var options = {
            access_token: token,
            lightbox: this.payStationStyle
        };
        XPayStationWidget.init(options);
        XPayStationWidget.open();
    }

    getPrice(cartData){
        return {
            amount: cartData.price.amount,
            amountWithoutDiscount: cartData.price.amount_without_discount,
            currency: '$'
        };
        ;
    }

    getCountItems(cartData){
        var count = 0;
        cartData.items.forEach((item) => {
            count += item.quantity;
        });

        return count;
    }
}

function getUsdPrice(prices) {
    prices = prices.filter((price) => {
        return price.currency === 'USD';
    });
    return '$' + prices[0].amount;
}

var cart = new Cart();
