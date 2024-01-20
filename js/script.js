let lastScroll = 0
const defaultOffSet = 200
const header = document.querySelector('.main-header')

const scrollPosition = () => window.pageYOffset || document.documentElement.scrollTop

const containHide = () => header.classList.contains('hideHeader')

window.addEventListener('scroll', () => {
    if (scrollPosition() > lastScroll && !containHide()) {
        header.classList.add('hideHeader')
    } else if (scrollPosition() < lastScroll && containHide()) {
        header.classList.remove('hideHeader')

    }


    lastScroll = scrollPosition()
})


async function fetchProductsData(link) {

    try {
        const promise = await fetch(link);

        if (!promise.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await promise.json();
        return data;
    } catch (error) {
        console.error('Error here!:', error);
        return [];
    }

}



function dataProcesing(data, route) {

    if (route === "products") {
        const phonesCardContainer = document.getElementById('product-row-phone'); //  phones
        const monitorsCardContainer = document.getElementById('product-row-monitor'); //  monitors
        const keyboardsCardContainer = document.getElementById('product-row-keyboard'); //  keyboards

        const cardTemplate = document.getElementById('template');

        phonesCardContainer.innerHTML = '';
        monitorsCardContainer.innerHTML = '';
        keyboardsCardContainer.innerHTML = '';


        data.forEach(product => {
            const cardClone = cardTemplate.cloneNode(true);
            cardClone.id = product.id;

            cardClone.querySelector('.product-img').src = `imgs/${product.image}`;
            cardClone.querySelector('.product-img').alt = product.name;
            cardClone.querySelector('.product-name').textContent = product.name;
            cardClone.querySelector('.description').textContent = product.description;
            if (product.oldPrice) {
                cardClone.querySelector('.old-price').textContent = `${product.oldPrice}ZL`;
            }
            cardClone.querySelector('.new-price').textContent = `${product.price}ZL`;


            if (product.category === "phone") {
                phonesCardContainer.appendChild(cardClone);
            } else if (product.category === "monitor") {
                monitorsCardContainer.appendChild(cardClone);
            } else if (product.category === "keyboard") {
                keyboardsCardContainer.appendChild(cardClone);
            }

        });
    } else if (route === "termsOfUse") {
        let termsOfUseBody = document.getElementById('termsOfUseBody')
        termsOfUseBody.innerHTML = data.htmlForTermsOfUse
        let payDeliveryBody = document.getElementById('payDeliveryBody')
        payDeliveryBody.innerHTML = data.htmlForPayDelivery
    }

}

const createRowFromData = (item, route) => {
    if (route === 'cart') {
        const cartItem = document.createElement('tr');
        cartItem.innerHTML = `
         <th scope="row"></th>
         <td><img class="product-img" src="${item.productImage}" alt="${item.productName}"></td>
         <td><a class="product-name " href="#">${item.productName}</a></td>
         <td class="product-price">${item.productPrice}</td>
         <td><input class="quantity-product" type="number" min="1" max="10" value="1"></td>
         <td class="final-product-price"> ${item.productPrice}</td>
         <td ><i class="follow fa-solid fa-heart fa-xl " ></i></td>
         <td><i class="fa-solid fa-x fa-xl remove-product" ></i></td>
     `;
        return cartItem
    } else if (route === 'follow') {
        const followItem = document.createElement('tr');
        followItem.innerHTML = `
         <th scope="row"></th>
         <td><img class="product-img" src="${item.productImage}" alt="${item.productName}"></td>
         <td><a class="product-name " href="#">${item.productName}</a></td>
         <td class="product-price">${item.productPrice}</td>
         <td ><i class="cart fa-solid fa-shopping-cart fa-xl " ></i></td>
         <td><i class="fa-solid fa-x fa-xl remove-product" ></i></td>
     `;
        return followItem
    }
}

function updateTotalPrice() {

    totalPrice = 0

    cartTableBody.querySelectorAll('tr').forEach((row) => {
        const rowFinalPrice = parseFloat(row.querySelector('.final-product-price').textContent.replace('zl', ''));
        totalPrice += rowFinalPrice;
    });
    allProductPriceCell.textContent = `${totalPrice}zl`;
}



function updateFinalPriceAndTotal(row, productPrice, quantity) {
    const finalPriceCell = row.querySelector('.final-product-price');
    const finalPrice = productPrice * quantity;
    finalPriceCell.textContent = `${finalPrice}zl`;

    updateTotalPrice();
}

const setPopup = (backgroundColor, maxWidth, htmlText) => {
    const popupContainer = document.getElementById('popup-cart');
    const popupTable = document.getElementById('popup-table-cart');
    popupTable.innerHTML = htmlText;
    popupContainer.style.maxWidth = maxWidth;
    popupTable.style.backgroundColor = backgroundColor;
}

function showPopup(str) {

    const popupContainer = document.getElementById('popup-cart');
    if (str === "cart") {
        setPopup('#cef5d9', `500px`, '<span>Product added to cart! <i class="fa-solid fa-shopping-cart fa-lg"></i></span>  <a class="link-in-popup "  title=""  data-bs-toggle="modal" data-bs-target="#modal-cart">open</a>');
    } else if (str === "follow") {
        setPopup('#cef5d9', `500px`, '<span>Product added to "Followed products"! <i class="fa-solid fa-heart fa-lg" style = "color: #ff2600;" ></i ></span>  <a class="link-in-popup"  title="" data-bs-toggle="modal" data-bs-target="#modal-follow">open</a>');
    } else if (str === "sameProduct") {
        setPopup('#f5cece', `400px`, '<span>This product has already been added</span>');
    } else if (str === "order") {
        setPopup('#f5cece', `400px`, '<span>This is not real online store!</span>');
    }
    setTimeout(() => {
        popupContainer.style.bottom = '5dvh';
        popupContainer.style.opacity = '1';
        popupContainer.style.visibility = 'visible';
        setTimeout(() => {
            popupContainer.style.bottom = '0';
            popupContainer.style.opacity = '0';
            popupContainer.style.visibility = 'hidden';
        }, 2500);
    }, 100);
}

function quantityInputFunctions(input, productPrice, row) {
    updateTotalPrice();

    totalRow.style.display = 'table-row';
    input.addEventListener('input', function () {
        let quantity = parseInt(input.value);
        if (quantity >= 1) {

            if (quantity <= 15) {

                updateFinalPriceAndTotal(row, productPrice, quantity);
            } else {
                input.value = Math.floor(quantity / 10);
                updateFinalPriceAndTotal(row, productPrice, input.value);
            }
        } else {
            updateFinalPriceAndTotal(row, productPrice, 1);
        }

    });

}

const cart = document.getElementById('table-body-cart');
const follow = document.getElementById('follow-table-body');

let cartProducts = [];
let followProducts = [];


const totalRow = document.getElementById('total-row');
const allProductPriceCell = totalRow.querySelector('.all-product-price');
let totalPrice = 0;
const cartTableBody = document.getElementById('table-body-cart');

document.addEventListener('DOMContentLoaded', async function () {
    let products = await fetchProductsData('https://raw.githubusercontent.com/rrrkkkvvv/products.github.io/main/products.json')
    let text = await fetchProductsData('https://raw.githubusercontent.com/rrrkkkvvv/products.github.io/main/texts.json')
    dataProcesing(products, 'products')
    dataProcesing(text, "termsOfUse")
    allEvents()
    JSON.parse(localStorage.getItem('cartProducts')).forEach(item => {


        const cartItem = createRowFromData(item, 'cart')


        let quantityInput = cartItem.querySelector('.quantity-product')
        quantityInputFunctions(quantityInput, parseFloat(item.productPrice), cartItem)

        cartProducts.push(item)
        cart.appendChild(cartItem)
    })
    updateTotalPrice()
    JSON.parse(localStorage.getItem('followProducts')).forEach(item => {

        const followItem = createRowFromData(item, 'follow');
        followProducts.push(item)
        follow.appendChild(followItem)
    })
})




function allEvents() {


    function saveLocalStorage() {
        localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
        localStorage.setItem('followProducts', JSON.stringify(followProducts));
    }

    function addToLocalStorage(productSource, route) {

        let productName = productSource.querySelector('.product-name').textContent;
        let productPrice = productSource.querySelector('.product-price').textContent;
        let productImage = productSource.querySelector('.product-img').getAttribute('src');
        let productForLocalStorage = {
            productName: productName,
            productPrice: productPrice,
            productImage: productImage,
        }

        function checkForFrequency(route, product) {
            let count
            if (route === "cart") {
                cartProducts.forEach(item => {
                    if (item.productName === product.productName) {
                        count++
                    }
                })
            } else {
                followProducts.forEach(item => {
                    if (item.productName === product.productName) {
                        count++
                    }
                })
            }
            return count
        }

        if (route === "cart") {
            if (!checkForFrequency('cart', productForLocalStorage)) {


                cartProducts.push(productForLocalStorage);
                saveLocalStorage();

            }
        } else {
            if (!checkForFrequency('follow', productForLocalStorage)) {
                followProducts.push(productForLocalStorage);
                saveLocalStorage();
            }
        }



    }



    function checkIfAllLettersPresent(string, arrayForCheck) {
        const letterCountMap = {}
        for (const char of string) {
            letterCountMap[char] = (letterCountMap[char] || 0) + 1
        }

        return arrayForCheck.every(char => {
            const countInString = letterCountMap[char] || 0
            const countInArray = arrayForCheck.filter(el => el === char).length;
            return countInString >= countInArray;
        })
    }


    function search(inputValue) {
        if (inputValue !== '') {

            allItems.forEach((elem) => {

                let productName = elem.querySelector(".product-name").textContent;
                let productNameInnerHTML = elem.querySelector(".product-name").innerHTML;
                let splitInputValue = inputValue.split('');


                if (checkIfAllLettersPresent(productName.toLowerCase(), splitInputValue)) {
                    elem.classList.remove('hide');

                    splitInputValue.forEach((char) => {

                        elem.querySelector(".product-name").innerHTML = replaceLettersWithSpan(productNameInnerHTML, char);

                    })

                } else {
                    elem.classList.add('hide');
                    elem.querySelector(".product-name").innerHTML = elem.querySelector(".product-name").textContent;
                }
            });
        } else {
            allItems.forEach((elem) => {
                elem.classList.remove('hide');
                elem.querySelector(".product-name").innerHTML = elem.querySelector(".product-name").textContent;
            });
        }
    }


    function replaceLettersWithSpan(inputString, targetLetter) {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = inputString;

        const textNodes = getTextNodes(tempContainer);


        textNodes.forEach(node => {

            const replacedHTML = node.nodeValue.replace(new RegExp(targetLetter, 'gi'), match => `<span class="marked-text">${match}</span>`);
            const tempDiv = document.createElement('div');

            tempDiv.innerHTML = replacedHTML;

            node.replaceWith(...tempDiv.childNodes);



        });

        return tempContainer.innerHTML;
    }

    function getTextNodes(element) {
        const textNodes = [];

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        return textNodes;
    }




    function checkProductUniqueness(pName, body) {

        let check = false
        let allNames = body.querySelectorAll('.product-name');

        allNames.forEach(name => {
            if (pName.innerHTML === name.innerHTML) {
                check = true
            }
        });
        return !check
    }





    function createNewRowFromCard(productCard, isCart) {
        const productName = productCard.querySelector('.product-name').textContent;

        const newRow = document.createElement('tr');

        newRow.innerHTML = `
         <th scope="row"></th>
         <td><img class="product-img" src="${productCard.querySelector('.product-img').getAttribute('src')}" alt="${productName}"></td>
         <td><a class="product-name " href="#">${productName}</a></td>
         <td class="product-price">${productCard.querySelector('.product-price').textContent}</td>
         ${isCart ? '<td><input class="quantity-product" type="number" min="1" max="10" value="1"></td>' : ''}
         ${isCart ? `<td class="final-product-price"> ${productCard.querySelector(".product-price").textContent}</td>` : ''}
         ${isCart ? '<td ><i class="follow fa-solid fa-heart fa-xl " ></i></td>' : '<td ><i class="cart fa-solid fa-shopping-cart fa-xl " ></i></td>'}
         <td><i class="fa-solid fa-x fa-xl remove-product" ></i></td>
     `;


        return newRow.innerHTML

    }

    function removeProduct(e, route) {
        const row = e.target.closest('tr');
        const pName = row.querySelector('.product-name').textContent

        if (route === 'cart') {



            row.remove();

            updateTotalPrice();



            cartProducts = cartProducts.filter((item) => item.productName !== pName)
            saveLocalStorage()
        } else {
            followProducts = followProducts.filter((item) => item.productName !== pName)
            saveLocalStorage()
            row.remove();

        }


    }

    const seachButton = document.getElementById('search-button');
    const seachInput = document.getElementById('search-input');
    let allItems = document.querySelectorAll(".product-col");

    seachInput.addEventListener('input', function () {
        let value = this.value.trim().toLowerCase();
        search(value);
    })
    seachButton.addEventListener('click', function () {
        let value = seachInput.value.trim().toLowerCase();
        search(value);
    })


    const menuLinks = document.querySelectorAll('.menu__list-link');
    const contentRows = document.querySelectorAll('.product-row');


    const productCartLinks = document.querySelectorAll('.cart');
    const productFollowLinks = document.querySelectorAll('.follow');
    const followTableBody = document.getElementById('follow-table-body');

    menuLinks.forEach(link => {
        link.addEventListener('click', function () {
            menuLinks.forEach(link => {
                link.classList.remove('_active');
            });
            contentRows.forEach(content => {
                content.style.contentVisibility = 'hidden';
            });

            const target = link.getAttribute('data-target');

            const selectedContent = document.getElementById(target);

            if (selectedContent) {
                link.classList.add('_active');
                selectedContent.style.contentVisibility = 'visible';
            }
        });
    });


    const productPriceElements = document.querySelectorAll('.price');

    productPriceElements.forEach(productPriceElement => {
        const oldPriceElement = productPriceElement.querySelector('.old-price');
        const newPriceElement = productPriceElement.querySelector('.new-price');

        if (oldPriceElement.textContent) {
            newPriceElement.style.color = 'red';
        } else {
            newPriceElement.style.color = '#5fa36a';
        }
    });







    productCartLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const productCard = link.closest('.product-card');


            const productPrice = parseFloat(productCard.querySelector('.new-price').textContent.replace('zl', ''));

            const newRow = document.createElement('tr');
            newRow.innerHTML = createNewRowFromCard(productCard, 'isCart')

            if (checkProductUniqueness(productCard.querySelector('.product-name'), cartTableBody)) {
                cartTableBody.appendChild(newRow);
                updateTotalPrice();
                addToLocalStorage(newRow, 'cart')

                totalRow.style.display = 'table-row';
                showPopup('cart');

                const quantityInput = newRow.querySelector('.quantity-product');
                quantityInputFunctions(quantityInput, productPrice, newRow)

            } else {
                showPopup('sameProduct')
            }

        });
    });

    cartTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-product')) {
            removeProduct(e, 'cart');
            updateTotalPrice();
        }
        if (e.target.classList.contains('follow')) {

            let target = e.target;

            const productRow = target.closest('tr');


            const newRow = document.createElement('tr');
            newRow.innerHTML = createNewRowFromCard(productRow);

            if (checkProductUniqueness(productRow.querySelector('.product-name'), followTableBody)) {
                followTableBody.appendChild(newRow)
                addToLocalStorage(newRow)
                showPopup('follow')
            } else {
                showPopup('sameProduct')
            }
        }
    });




    productFollowLinks.forEach((link) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const productCard = link.closest('.product-card');

            const newRow = document.createElement('tr');
            newRow.innerHTML = createNewRowFromCard(productCard)

            if (checkProductUniqueness(productCard.querySelector('.product-name'), followTableBody)) {
                followTableBody.appendChild(newRow)
                addToLocalStorage(newRow)
                showPopup('follow')
            } else {
                showPopup('sameProduct')
            }

        });
    });


    followTableBody.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-product')) {
            removeProduct(e);
        }
        if (e.target.classList.contains('cart')) {
            let target = e.target;

            const productFollowRow = target.closest('tr');


            const productPrice = parseFloat(productFollowRow.querySelector('.product-price').textContent.replace('zl', ''));
            const newFollowRow = document.createElement('tr');
            newFollowRow.innerHTML = createNewRowFromCard(productFollowRow, 'isCart')


            if (checkProductUniqueness(productFollowRow.querySelector('.product-name'), cartTableBody)) {
                cartTableBody.appendChild(newFollowRow);
                addToLocalStorage(newFollowRow, 'cart')
                const quantityInput = newFollowRow.querySelector('.quantity-product');

                quantityInputFunctions(quantityInput, productPrice, newFollowRow)

                updateTotalPrice();
                totalRow.style.display = 'table-row';
                showPopup('cart');



            } else {
                showPopup('sameProduct')
            }
        }
    });


    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('order-btn')) {
            showPopup('order')
        } else if (e.target.classList.contains('product-name')) {
            e.preventDefault()
        }
    })

}

