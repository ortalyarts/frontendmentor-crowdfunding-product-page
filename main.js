const toggleContainer = document.querySelector('.switch-container');
const toggleSwitch = document.querySelector('#bookmark-toggle-button');
const btnToggleText = document.querySelector('.switch-container span');

//change bookmark toggle
function switchTheme(e) {
    if (e.target.checked) {
        toggleSwitch.checked = true;
        btnToggleText.innerText = "Bookmarked";
        toggleContainer.classList.add('active');
    } else {
        toggleSwitch.checked = false;
        btnToggleText.innerText = "Bookmark";
        toggleContainer.classList.remove('active');
    }    
}
//listener for changing bookmark
toggleSwitch.addEventListener('change', switchTheme, false);


// Navigation
const menuIcon = document.querySelector('#menu-icon');

const menuMainContainer = document.querySelector('#top-nav');
const menuContainer = document.querySelector('#top-nav-container');
const menuUl = document.querySelector('#nav-ul');
const userActionsUl = document.querySelector('#user-actions');

// for Mobile - Toggle open menu
const closeMainMenu = () => {
  menuMainContainer.classList.remove('active-top-menu');
  menuContainer.style.right='-100%';
  menuUl.style.opacity='0';
  menuIcon.ariaExpanded = "false";
  menuIcon.focus();
}

menuIcon.addEventListener('click', ()=>{
  if(menuIcon.ariaExpanded == 'false'){
    menuMainContainer.classList.add('active-top-menu');
    menuContainer.style.right='0%';
    menuUl.style.opacity='1';
    menuIcon.ariaExpanded = "true";
  } else {
    closeMainMenu();
  }
});


//Populate products from JSON

function listItemsForEach(data) {
    data.forEach((item, index) => {
        
        let price = "";
        let priceTxt = "";
        if(item.startPrice){
            price = item.startPrice;
            priceTxt = `Pledge $${item.startPrice} or more`;
        };
        let stockTxt = "";
        if(item.stock || item.stock === 0){
            stockTxt = `<span>${item.stock} </span>left`;
        };
        let btnDialogText = `Continue`; // to change text if item is sold out

        el = document.createElement('div');
        el.classList.add('card');
        el.classList.add('accordion-card');
        let btnDisabled ="";
        if(!item.inStock){
            el.classList.add("sold-out");
            btnDisabled = `disabled`;
            btnDialogText = `Out of stock`;
        }
        //Dialog
        el.innerHTML = 
            `  
            <h3>
                <button id="accordion-header-${index}"
                        aria-expanded="false"
                        aria-controls="accordion-panel-${index}"
                        class="accordion-header">
                    
                    <div aria-hidden="true" class="radio"></div>
                    <div class="accordion-title-holder">
                    <div class="product-title">
                        ${item.title}
                    </div>
                    <div class="product-starting-price">${priceTxt}</div>
                    <div class="product-left-instock" id="dialog-stock-${index}">${stockTxt}</div>
                    </div>
                </button>
                <p class="accordion-header-description" tabindex="-1">
                    ${item.desc}
                </p>
            </h3>
            <section id="accordion-panel-${index}"
                        aria-labelledby="accordion-header-${index}"
                        class="expandable-bottom"
                        hidden>
                <label for="input-${index}" class="pledge-label">Enter your pledge</label>
                <div class="input-holder">
                    <p class="static-input-value">$</p>
                    <input type="text" id="input-${index}" class="text-input" value="${price}" aria-describedby="error-${index}" oninput=onInputNumbers(event) maxlength="4">
                    <p id="error-${index}" class="error-message invisible" tabindex="-1" aria-live="polite"></p>
                </div>
                
                <button class="btn" onclick="pledgeSelected('input-${index}')" ${btnDisabled}>${btnDialogText}</button> 
            </section>
            `;

        document.querySelector('#accordion-holder').appendChild(el);
        
        //Home-page content
        let btnHomepageText = "Select Reward";
        el2 = document.createElement('div');
        el2.classList.add('card');
        if(!item.inStock){
            el2.classList.add("sold-out");
            btnHomepageText = "Out of stock";
        }
        el2.innerHTML = 
        `
          <div class="card-title">
            <h3>${item.title}</h3>
            <p class="price">${priceTxt}</p>
          </div>
          <p class="desc">
            ${item.desc}
          </p>
          <div class="card-bottom">
            <p class="stock" id="homepage-stock-${index}">
                ${stockTxt}
            </p>
            <button class="btn" onclick="pledgeSelected('input-${index}', ${item.startPrice})" ${btnDisabled}>${btnHomepageText}</button> 
          </div>
        `;

        document.querySelector('#cards-holder').appendChild(el2)
        
    
      });
}


async function fetchData(){
    try{
        const response = await fetch(`/data.json?v=1711534683`)

        if(!response.ok){
            throw new Error("Could not fetch resource")
        }

        const data = await response.json();

        // ==== if json data ok: populate data


        listItemsForEach(data);

        // ====== end of populate data

    }
    catch(error){
        console.log(error);
    }
}

fetchData().then(() => {
    accordion();
    const cardsHolderHomePage = document.querySelector('#cards-holder');
    cardsHolderHomePage.removeChild(cardsHolderHomePage.firstElementChild);
});

//End - Poplate JSON

// Progress bar

let width = Number(89914 / 1000); //temp for this project
let currentBacke;
let backedElem = document.querySelector('#backed');


let backedRaw = backedElem.innerText;
let backed = Number(backedRaw.replace(",", "")); //cleaning the sum form ","
let newWidth;

function progressBarAnimation() {

    const elem = document.getElementById("progress-bar");
    const elemContainerWidth = document.querySelector('.progress-bar-holder').clientWidth;
 
    let currentBackePercent = currentBacke / 1000;

    let totalBacked = width + currentBackePercent; 

    backed += currentBacke;
    let formattedNumber = backed.toLocaleString(); //formatting the sum with ","

    // Animation for the progress bar
    document.querySelector(".progress-bar-animation").animate(
        [
            { opacity:1, transform: "translateX(0)" },
            { opacity:0, transform: "translateX(100%)" }
        ], {
            duration: 2000,
          }
    )

    backedElem.innerText = formattedNumber;

    if(newWidth >= elemContainerWidth){
        elem.style.width = "100%";
        return;
    }

    let id = setInterval(frame, 10);
    function frame() {
        if (width >= totalBacked || width >= 100) {
        clearInterval(id);
        } else {
        //width++; // this doesn't work because the percentage of the Pledge is sometimes smaller than 1%
        width += currentBackePercent / 2;
        elem.style.width = width + '%';
        }
    }
    newWidth = elem.clientWidth;
}

// prevent typing letters in number fields
const onInputNumbers = event => {
    event.target.value = event.target.value.replace(/[^0-9+]/g, '')
  }


const backesElem = document.querySelector('#backes');
let backers = 5007;

//"continue" clicked & pledge is valid and 
 const pledgeSelected = (input, price) => {
    
    let userInput = document.querySelector(`#${input}`);
    const errorMessage = userInput.parentElement.querySelector('.error-message');
    
  
    if(price){ // for homepage variant
        currentBacke = price;
        openDialog('thankYou');
    } else if (!isNaN(userInput.value) && userInput.value !== "") { // Number validation (vor dialog variant)
        currentBacke = Number(userInput.value);
        document.querySelector(`#backThisProject`).close();
        openDialog('thankYou');
        if(!errorMessage.classList.contains('invisible')){
            errorMessage.classList.add('invisible');
            errorMessage.innerText="";
        }
    } else { // error
        if(errorMessage.classList.contains('invisible')){
            errorMessage.innerText="Please enter pledge";
            errorMessage.classList.remove('invisible');
        }
  }

    

    //update "in stock" text after purchaise
    let index = input.substring(6); // get the index of the product
    if(index == 0) return; // stop function, because there is no stock for the "Pledge with no reward"

    stockElemHomepage = document.querySelector(`#homepage-stock-${index} span`);
    stockElemDialog = document.querySelector(`#dialog-stock-${index} span`);

    let stock = Number(stockElemHomepage.innerText) - 1; 
    stockElemHomepage.innerText = stock;
    stockElemDialog.innerText = stock;

 }


// open dialog
const btnBackProject = document.querySelector('#back-project');


const openDialog = (dialog) => {
    dialogElem = document.querySelector(`#${dialog}`); 
    dialogTitle = document.querySelector(`#${dialog} h2`); 
    dialogElem.showModal();
    dialogTitle.focus(); // focus screen reader on the first title of the dialog
    btnBackProject.setAttribute('aria-expanded', 'true');
}


// accordion

const accordion = () => {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    Array.prototype.forEach.call(document.querySelectorAll('.accordion-header'), accordionHeader => {
        let target = accordionHeader.parentElement.nextElementSibling;
    
        accordionHeader.onclick = () => {
            let expanded = accordionHeader.getAttribute('aria-expanded') === 'true' || false;
            accordionHeader.setAttribute('aria-expanded', !expanded);
            target.hidden = expanded;
            accordionHeader.parentElement.querySelector('.accordion-header-description').focus();
        }
    })
}



//close dialog
document.querySelector('#close-dialog').addEventListener('click', ()=>{
    document.querySelector(`#backThisProject`).close();
    btnBackProject.setAttribute('aria-expanded', 'false');
})

//close thank you dialog
document.querySelector('#btn-thank-you').addEventListener('click', ()=>{
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    document.querySelector(`#thankYou`).close();
    
    delay(500).then(() => { 
        progressBarAnimation();
        //Update numbers (total backed, backers)
        backers++;
        backesElem.innerText = backers.toLocaleString();

    });

    btnBackProject.setAttribute('aria-expanded', 'false');
    
})