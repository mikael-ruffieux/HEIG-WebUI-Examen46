import 'css/style.css';

import JsonStorage from "lib/JsonStorage";
import "loadServiceWorker.js";


import tmplPerson from "templates/person.hbs";
import tmplLoan from "templates/loan.hbs";


/* Navigation */

document.querySelector("ui-button").addEventListener("click", evt => {
    let navbar = document.querySelector("#wrapper > nav");
    navbar.style.display = navbar.style.display === 'block' ? 'none' : 'block';
});

// HTML api History
const changePage = (event) => {
    let h = document.location.hash;
  
    // validate anchor
    if (!h) h = "#persons";
    try {document.querySelector(h)} catch { return }
    if (!document.querySelector(h)) {
      h = "#persons";
    }
  
    // Hide all pages
    let pages = document.querySelectorAll("section");
    for (let page of pages) page.classList.add('hidden');
    // Show the selected one
    let currentPage = document.querySelector(h);
    currentPage.classList.remove('hidden');
  
    // remove "active" feddback on menu links
    let links = document.querySelectorAll("#wrapper > nav a");
    for (let link of links) link.classList.remove('active');
    // and add it to the current gactive one
    let currentLink = document.querySelector(`[href="${h}"]`);
    currentLink.classList.add('active');
  
    window.scrollTo(0, 0);
}
  
window.addEventListener("popstate", changePage);
changePage();


/* ##### Gestion du LocalStorage ##### */

let personsStorage = new JsonStorage({name: "persons", eventName: "persons-changed"});
let loansStorage = new JsonStorage({name: "loans", eventName: "loans-changed"});

// Fonction servant à comparer 2 personnnes
let comparePersons = (p1, p2) => p1.person.localeCompare(p2.person);

// Fonction servant à comparer 2 prêts
let compareLoans = (l1, l2) => l1.loan.localeCompare(l2.loan);

/* ##### DOM Update ##### */

const updatePersonList = () => {
    let listPersons = document.getElementById("persons-list");
    let listOptions = document.getElementById("loan-input-person");
    listPersons.textContent = "";
    listOptions.textContent = "";


    let sortedPersons = personsStorage.sort(comparePersons);

    for (let [key, person] of sortedPersons) {
        // Ajout dans la liste des personnes
        listPersons.insertAdjacentHTML("beforeend", tmplPerson({...person, key}))

        // Ajout dans la liste déroulante
        var option = document.createElement("option");
        option.text = person.person;
        option.value = key;
        listOptions.appendChild(option);
    }
}

const updateLoansList = () => {
    let listLoans = document.getElementById("loans-list");
    listLoans.textContent = "";

    let sortedLoans = loansStorage.sort(compareLoans);

    for (let [key, loan] of sortedLoans) {
        // Ajout dans la liste des prêts
        let loanerName = personsStorage.getItem(`${loan.loaner}`).person;
        listLoans.insertAdjacentHTML("beforeend", tmplLoan({...loan, key, loanerName}))
    }
}

/* ##### Gestion des personnes ##### */

// Ajout d'une nouvelle personne
document.querySelector('form#person-form-add').addEventListener("submit", evt => {
    evt.preventDefault();
    personsStorage.addItem({ // et on ajoute les champs au localStorage, avec les 2 valeurs (le addItem provoque une mise à jour du DOM)
        person: document.querySelector('#person-input-name').value
    });
    document.querySelector('#person-input-name').value = "";
});

// Modification/Suppresion d'une personne
document.querySelector('#persons-list').addEventListener("click", evt => {
    const btn = evt.target;
    if (btn.dataset.prompt) { // Si c'est édition
        let newName = prompt("Modifier le nom", btn.dataset.prompt);
        if (newName != null) {
            personsStorage.setItem(btn.dataset.key, { 
                person: newName
            });
        }
    // Gestion de la suppression
    } else if (btn.dataset.alert && btn.dataset.key) {
        console.log("Supprimer", btn.dataset.key);
    }
});

/* ##### Gestion des prêts ##### */

// Ajout d'un nouveau prêt
document.querySelector('form#loan-form-add').addEventListener("submit", evt => {
    evt.preventDefault();
    let input = document.querySelector('#loan-input-thing');
    let loanerKey = document.querySelector('#loan-input-person').value;
    console.log(input.value, loanerKey);
    
    loansStorage.addItem({ // et on ajoute les champs au localStorage, avec les 2 valeurs (le addItem provoque une mise à jour du DOM)
        loan: input.value,
        loaner: loanerKey
    });
    input.value = "";
});


/* ##### Gestion online/offline ##### */

let connIcon = document.querySelector("span.conn-status");

window.addEventListener("online", (event) => {
    connIcon.classList.remove("disconnected");
});
window.addEventListener("offline", (event) => {
    connIcon.classList.add("disconnected");
});


/* ##### Event managers ##### */

// Si une personne est ajoutée ou supprimée du localStorage (événement = persons-changed), on met à jour le DOM
window.addEventListener("persons-changed", updatePersonList);
updatePersonList(); // on met à jour le DOM une première fois

window.addEventListener("persons-changed", updateLoansList);
window.addEventListener("loans-changed",updateLoansList);
updateLoansList();

