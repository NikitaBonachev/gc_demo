'use strict';

class Cart {
    cartId;
    token;
    availableItems;

    baseURL = 'https://store.xsolla.com/api/v1/project/30810';

    payStationStyle = {
        width: '740px',
        height: '700px',
        spinner: 'round'
    };

    setToken(token) {
        this.token = token;
    }

    setCartId(cartId) {
        Cookies.set('xsolla_cart_id', cartId);
        this.cartId = cartId;
    }

    createCart(callback) {
        var obj = this;
        $.post({
            url: obj.baseURL+'/cart',
            headers: {
                'Authorization': 'Bearer ' + this.token
            },
            success: function (data) {
                obj.cartId = data.id;
                obj.setCartId(obj.cartId);
                callback && callback();
            }
        });
    }

    removeItemFromCart(sku) {
        var obj = this;
        $.ajax(
            {
                url: obj.baseURL+'/cart/'+obj.cartId+'/item/' + sku,
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

    addToCart(item) {
        var sku = $(item).data('sku');
        var quantity = $(item).data('quantity');
        var obj = this;
        $.ajax(
            {
                url: obj.baseURL+'/cart/'+obj.cartId+'/item/' + sku,
                method: 'PUT',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
                data: JSON.stringify({
                    quantity: quantity
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
            url: obj.baseURL+'/payment/cart/' + obj.cartId,
            dataType: 'json',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            },
            data: JSON.stringify({
                locale: 'en'
            }),
            success: function (data) {
                $('.overlay').hide();
                obj.openPayStation(data.token);
            }
        });
    }

    getCart(){
        var obj = this;
        $.get({
            url: obj.baseURL+'/cart/' + obj.cartId,
            dataType: 'json',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            },
            success: function (data) {
                var cartPrice = obj.getPrice(data);
                var counter = obj.getCountItems(data);

                var html = '<h6>' + counter + ' items</h6>';

                if (cartPrice.amountWithoutDiscount === cartPrice.amount) {
                    html += '<h6>' +
                        '<span style="font-size:1.1em"> ' + cartPrice.currency + cartPrice.amount +'</span>' +
                        '</h6>';
                } else {
                    html += '<h6>' +
                        '<span style="text-decoration: line-through;">' + cartPrice.currency + cartPrice.amountWithoutDiscount +'</span>' +
                        '<span style="font-size:1.1em"> ' + cartPrice.currency + cartPrice.amount +'</span>' +
                        '</h6>';
                }

                $('#cart-counter').html(html);
            },
            error: function () {
                obj.createCart();
            }
        });
    }

    quickBuy(sku) {
        var obj = this;
        $('.overlay').show();
        $.post(
            {
                'url': obj.baseURL+'/payment/item/' + sku,
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

    formatPrice(price) {
        var parts = ("" + price).split(".");

        if (parts.length > 1) {
            return parts[0] +  "." + parts[1].substr(0, 2);
        } else {
            return price;
        }
    }

    getPrice(cartData){
        return {
            amount: this.formatPrice(cartData.price.amount),
            amountWithoutDiscount: this.formatPrice(cartData.price.amount_without_discount),
            currency: '$'
        };
    }

    getCountItems(cartData){
        var count = 0;
        cartData.items.forEach((item) => {
            count += item.quantity;
        });

        return count;
    }

    setAvailableItem(sku) {
        if (!this.availableItems) {
            this.availableItems = {};
        }

        this.availableItems[sku] = 1;
    }

    updateAvailableItem(sku, quantity) {
        this.availableItems[sku] = Math.max(this.availableItems[sku] + quantity,1);
        $('#add_button_' + sku)[0].innerHTML = 'ADD TO CART ' + this.availableItems[sku];
        $($('#add_button_' + sku)[0]).data('quantity', this.availableItems[sku]);
    }
}

function getUsdPrice(prices) {
    prices = prices.filter((price) => {
        return price.currency === 'USD';
    });
    return '$' + prices[0].amount;
}

var cart = new Cart();
