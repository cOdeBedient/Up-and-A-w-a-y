import { handleFetch, handleTripPost } from './api-calls';
import { updateTraveler, compileTripData } from './traveler-info';
import { userLogins } from './login-data/user-logins';


// QUERY SELECTORS
const tripsContainer = document.querySelector('.trips-container');
const tripsListContainer = document.querySelector('.trips-list');
const dollarsSpent = document.querySelector('.dollars-spent');
const destinationsListContainer = document.querySelector('.destinations-list');
const loginPage = document.querySelector('.login-form');
const usernameField = document.querySelector('#username');
const passwordField = document.querySelector('#password');
const loginSubmitButton = document.querySelector('.login-submit-button');
const mainPage = document.querySelector('main');
const header = document.querySelector('header');
const errorPage = document.querySelector('.error-message');
const passwordError = document.querySelector('.password-error');
const body = document.querySelector('body');
const myTripsButton = document.querySelector('.my-trips-button');
const spentContainer = document.querySelector('.spent-container');
const destinationsHeading = document.querySelector('.destinations-heading');
const destInfoButton = document.querySelector('.toggle-destinations');


// EVENT LISTENERS
loginSubmitButton.addEventListener('click', function(event) {
    logIn(event);
});

destinationsListContainer.addEventListener('submit', function(event) {
    event.preventDefault();
    handleSubmitClick(event);
});

destinationsListContainer.addEventListener('keyup', function(event) {
    handleFormEntry(event);
});

destinationsListContainer.addEventListener('input', function(event) {
    handleFormEntry(event);
});

tripsListContainer.addEventListener('keydown', function(event) { 
    if(event.key === 'Enter') {
        expandTripDetails(event, 'trip');
    }
});

tripsListContainer.addEventListener('click', function(event) {
    expandTripDetails(event, 'trip');
});

destInfoButton.addEventListener('click', toggleDestinationInfo);

myTripsButton.addEventListener('click', showMyTrips);

destinationsListContainer.addEventListener('click', function(event) {
    expandDestinationDetails(event, 'destination');
});

destinationsListContainer.addEventListener('keydown', function(event) {
    if(event.key === 'Enter') {
        expandDestinationDetails(event, 'destination');
    }
});


// GLOBAL VARIABLES
let currentTraveler;
let allTrips;
let allDestinations;


// FUNCTIONS
function getAllData(id) {
    handleFetch(id)
    .then(([traveler, tripData, destinationData]) => {
        allTrips = tripData.trips;
        allDestinations = destinationData.destinations.sort((a, b) => a.destination.localeCompare(b.destination));
        currentTraveler = updateTraveler(traveler, allTrips, allDestinations);
        renderDom();
    })
    .catch(error => {
        displayError(error.message);
    })
}

function handleSubmitClick(event) {
    event.preventDefault();
    const clickedDestinationContainer = event.target.closest('.destination-container');
    let destinationForm = event.target.closest('form');
    let formButton = destinationForm.querySelector('button');
    let destinationId = destinationForm.id.split('-')[1];
    let newTripData = destinationForm.querySelectorAll('input');
    const [numTravelers, departureDate, duration] = newTripData;
    if(numTravelers.value && departureDate.value && duration.value) {
        const plane = clickedDestinationContainer.querySelector('#plane');
        plane.classList.toggle('fly');
        plane.classList.toggle('fly-back');
        formButton.disabled = true;
        setTimeout(function() {plane.classList.toggle('fly')}, 3000);
        setTimeout(function() {plane.classList.toggle('fly-back')}, 3000);
        handleTripSubmit(event, destinationId, numTravelers, departureDate, duration);
    }
}

function handleFormEntry(event) {
    let checkHeader = event.target.closest('.destination-header')
    if((event.target.tagName != "BUTTON") && !checkHeader) {
        let destinationForm = event.target.closest('form');
        let formButton = destinationForm.querySelector('button');
        let destinationId = destinationForm.id.split('-')[1];
        let newTripData = destinationForm.querySelectorAll('input');
        const [numTravelers, departureDate, duration] = newTripData; 
        if(numTravelers.value && departureDate.value && duration.value) {
            formButton.disabled = false;
            const costField = findCostField(event);
            updateTripCost(event, destinationId, numTravelers, departureDate, duration, costField);
        }
    }
}

function expandTripDetails(event) {
    event.preventDefault();
    const clickedTrip = event.target.closest('.trip-container');
    if(clickedTrip) {
        const clickedTripHeader = clickedTrip.querySelector('.trip-header');
        const clickedTripDetails = clickedTrip.querySelector('.trip-details');
        clickedTripDetails.classList.toggle('collapse')
        clickedTripDetails.classList.toggle('expand');
        const plane = clickedTripHeader.querySelector('img');
        plane.classList.toggle('fly');
        plane.classList.toggle('fly-back');
        const isExpanded = clickedTrip.getAttribute('aria-expanded') === 'true';
        if(isExpanded) {
            clickedTrip.setAttribute("aria-expanded", false);
        } else {
            clickedTrip.setAttribute("aria-expanded", true);
        }
    }
}

function handleTripSubmit(event, destinationId, numTravelers, departureDate, duration) {
    event.preventDefault();
    const newTrip = retrieveInputs(event, destinationId, numTravelers, departureDate, duration);
    allTrips.push(newTrip);
    clearDestinationData(event, numTravelers, departureDate, duration);
    handleTripPost(newTrip, 'https://up-and-away-api-f76be7fbb42b.herokuapp.com/api/v1/trips')
    .then(returnedTrip => {
        if(returnedTrip.ok) {
            currentTraveler = updateTraveler(currentTraveler, allTrips, allDestinations);
            renderDom()
        } else {
            let code = returnedTrip.status;
            let message = returnedTrip.statusText;
            throw new Error(`Oh no! Failed to Post: ${code} - ${message}.`);
        }
    })
    .catch(error => {
        displayError(error.message);
    })
}

function toggleDestinationInfo() {
    const details = destinationsListContainer.querySelectorAll('.destination-details');
    if(destInfoButton.innerText === 'show all details') {
        details.forEach((detail) => {
            detail.classList.remove('hidden');
        })
        destInfoButton.innerHTML = 'hide all details';
    } else {
        details.forEach((detail) => {
            detail.classList.add('hidden');
        })
        destInfoButton.innerHTML = 'show all details';
    }
}

function expandDestinationDetails(event) {
    // event.preventDefault();
    const clickedDestination = event.target.closest('.destination-container');
    if(clickedDestination){
        const clickedDestinationHeader = event.target.closest('.destination-header');
        const clickedDestinationDetails = clickedDestination.querySelector('.destination-details');
        if(!event.target.closest('.destination-details')) {
            clickedDestinationDetails.classList.toggle("hidden");
            const isExpanded = clickedDestinationHeader.getAttribute('aria-expanded') === 'true';
            if(isExpanded) {
                clickedDestinationHeader.setAttribute("aria-expanded", false);
            } else {
                clickedDestinationHeader.setAttribute("aria-expanded", true);
            }
        }
    }
}

function clearDestinationData(event, numTravelers, departureDate, duration) {
    event.preventDefault();
    const costField = findCostField(event);
    costField.innerText = ''
    numTravelers.value = '';
    departureDate.value = '';
    duration.value = '';
}

function findCostField(event) {
    event.preventDefault();
    const destinationDetails = event.target.closest('.destination-details');
    return destinationDetails.querySelector('p');
}

function renderDom() {
    renderMyTrips();
    renderDestinations();
    dollarsSpent.innerText = `$${currentTraveler.spentLastYear.group}`;
    destinationsHeading.innerHTML = `Plan your next adventure, &nbsp<span>${currentTraveler.name}</span>!`;
}

function renderMyTrips() {
    tripsListContainer.innerHTML = '';
    currentTraveler.trips.forEach((trip) => {
        const newTripContainer = document.createElement('div');
        newTripContainer.className = 'trip-container';
        newTripContainer.setAttribute("aria-expanded", false);
        const newTrip = document.createElement('div');
        newTrip.tabIndex = 0;
        newTrip.className = 'trip-header';
        newTrip.id = `trip-${trip.id}`;
        newTrip.innerHTML = `
            <h3 class='name'>${trip.destination.destination}</h3>
            <h4 class='date'>${trip.date}</h4>`;
        const newTripDetails = document.createElement('div');
        newTripDetails.className = 'trip-details collapse';
        newTripDetails.id = `trip-${trip.id}-details`;
        newTripDetails.innerHTML = `
            <img class='trip-image' src="${trip.destination.image}" alt=${trip.destination.alt}>
            <h5 class='trip-travelers'>Number of Travelers: ${trip.travelers}</h5>
            <h5 class='trip-duration'>Length of Trip: ${trip.duration}</h5>
            <h5 class='trip-cost-ind'>Group Cost: $${trip.cost.totalGroup}</h5>
            <h5 class='trip-cost-grp'>Cost Per Person: $${trip.cost.totalPerPerson}
            `;
        if(trip.status === 'pending') {
            newTrip.classList.add('pending');
            newTrip.innerHTML += `<h4 class='status'>... pending ...</h4>`;
            newTripDetails.classList.add('pending-details');
        } else if(trip.status === 'past') {
            newTrip.classList.add('past');
            newTrip.innerHTML += `<h4 class='status'>... past ...</h4>`;
            newTripDetails.classList.add('past-details');
        } else {
            newTrip.classList.add('upcoming');
            newTrip.innerHTML += `<h4 class='status'>... upcoming ...</h4>`;
            newTripDetails.classList.add('upcoming-details');
        }
        newTrip.innerHTML += `<img src='./images/new-plane.png' class='fly-back' id='plane' alt='plane icon'>`;
        tripsListContainer.appendChild(newTripContainer);
        newTripContainer.appendChild(newTrip);
        newTripContainer.appendChild(newTripDetails);
    })
}

function renderDestinations() {
    allDestinations.forEach((destination) => {
        const newDestinationContainer = document.createElement('div');
        newDestinationContainer.className = 'destination-container';
        newDestinationContainer.setAttribute("aria-expanded", true);
        const newDestination = document.createElement('div');
        newDestination.className = 'destination-header';
        newDestination.tabIndex = 0;
        newDestination.id = `destination-${destination.id}`;
        newDestination.innerHTML = `<h3 class='destination-name'>${destination.destination}</h3><img src='./images/new-plane.png' class='fly-back' id='plane' alt='plane icon'>`;
        const newDestinationDetails = document.createElement('div');
        newDestinationDetails.className = 'destination-details';
        newDestinationDetails.id = `destination-${destination.id}-details`;
        newDestinationDetails.innerHTML = `
            <img class='destination-image' src="${destination.image}" alt=${destination.alt}>
            <form class='trip-form' id='form-${destination.id}'>
                <div class="form-element">
                    <label for="travelers-${destination.destination}">Number of Travelers:</label>
                </div>
                <input class="travelers-field" id="travelers-${destination.destination}" type="number" min="1" placeholder="#ppl" required>
                <div class="form-element">
                    <label for="departure-${destination.destination}">Departure Date:</label>
                </div>
                <input class="departure-date-field" id="departure-${destination.destination}" type="date" min="2024-03-03" max="2026-03-03" placeholder="MM/DD/YYYY" required>
                <div class="form-element">
                    <label for="duration-${destination.destination}">Trip Length:</label>
                </div>
                <input class="duration-field" id="duration-${destination.destination}" type="number" min="1"  placeholder="#days" required>
                <div class="form-element">
                    <button class="submit-button" type="submit" disabled>Submit Trip!</button>
                </div>
            </form>
                <div class='new-costs'>
                    <h4 class='destination-cost-grp'>Trip Total:</h4>
                    <p></p>
                </div>   
            `;
            destinationsListContainer.appendChild(newDestinationContainer);
            newDestinationContainer.appendChild(newDestination);
            newDestinationContainer.appendChild(newDestinationDetails);
    })
}

function showMyTrips() {
    renderMyTrips()
    tripsContainer.classList.toggle('hidden');
    spentContainer.classList.toggle('hidden');
    if (myTripsButton.innerText === 'my trips') {
        myTripsButton.innerText = 'hide trips';
    } else {
        myTripsButton.innerText = 'my trips';
    }
}

function retrieveInputs(event, destinationId, numTravelers, departureDate, duration) {
    event.preventDefault();
        return {
            id: allTrips.length + 1,
            userID: currentTraveler.id,
            destinationID: parseInt(destinationId),
            travelers: parseInt(numTravelers.value),
            date: departureDate.value.replaceAll('-', '/'),
            duration: parseInt(duration.value),
            status: "pending",
            suggestedActivities: []
        }
}

function logIn(event) {
    event.preventDefault();
    passwordError.innerText = '';
    const username = usernameField.value;
    const password = passwordField.value;
    const foundUser = userLogins.find((login) => {
        return login.username === username && login.password === password;
    });
    if(foundUser) {
        const userId = parseInt(usernameField.value.replace('traveler', ''));
        toggleFromLogin();
        clearPasswordFields();
        getAllData(userId);
    } else if (userLogins.find (login => login.username === username)) {
        passwordError.innerText = '* invalid password *';
    } else {
        passwordError.innerText = '* username not found *';
    }
}

function clearPasswordFields() {
    usernameField.value = '';
    passwordField.value = '';
}

function toggleFromLogin() {
    loginPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    header.classList.remove('hidden');
    body.classList.add('background-color');
}

function updateTripCost(event, destinationId, numTravelers, departureDate, duration, costField) {
    const selectedTrip = retrieveInputs(event, destinationId, numTravelers, departureDate, duration);
    const compiledTrip = compileTripData([selectedTrip], allDestinations);
    const tripCostGroup = compiledTrip[0].cost.totalGroup;
    costField.innerText = `$${tripCostGroup}`;
};

function displayError(error) {
    mainPage.classList.add('hidden');
    header.classList.add('hidden');
    loginPage.classList.add('hidden');
    errorPage.classList.remove('hidden');
    errorPage.innerHTML = error;
};