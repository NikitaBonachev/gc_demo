'use strict';

class Inventory {
    token;
    baseURL = 'https://store.xsolla.com/api/v1/project/30810';

    setToken(token) {
        this.token = token;
    }

    show() {
        var obj = this;
        $.get({
            url: obj.baseURL+'/user/inventory/items',
            dataType: 'json',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer ' + this.token
            },
            success: function (data) {
                console.log(data);
                var items = data.items;
                items.forEach(function (item) {            
                    $('#inventory-items').append(
                        '   <div style="min-width: 160px; min-height: 225px;" class="col s1">' +
                        '       <div class=\"item\" style="padding: 10px; border: solid 1px black">' +
                        '           <div class=\"item-image waves-effect waves-block waves-light\" style="max-height: 100px; max-width: 100px; margin-left: auto; margin-right: auto">' +
                        '               <img style="min-width: 100%; max-height: 100px;" src=\"' + item.image_url + '\">' +
                        '           </div>' +                
                        '       </div>' +
                        '       <div class=\"item-info\" style="">' +
                        '           <div style="margin-left: auto; margin-right: auto;">' +
                        '               <p class="center">' + (item.quantity !== null ? item.quantity : item.instance_id.substring(0, 10)) + '</p>' +
                        '           </div>' +                
                        '       </div>' +                        
                        '   </div>'
                    )
                })
            }
        });
    }
}

var inventory = new Inventory();