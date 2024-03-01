import { prepareData } from './api-calls';
import { updateTraveler} from './traveler-info'

let currentTraveler;
let allTrips;
let allDestinations;

function getAllData(id) {
    prepareData(id)
    .then(([traveler, tripData, destinationData]) => {
        allTrips = tripData.trips;
        allDestinations = destinationData.destinations;
        currentTraveler = updateTraveler(traveler, allTrips, allDestinations);
        console.log('currentTraveler', currentTraveler)
        // renderDom(currentTraveler);
    })
}

// function renderDom(traveler) {

// }

getAllData(2);
