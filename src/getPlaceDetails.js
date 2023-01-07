// @flow strict
const { placesTypes } = require('./placesTypes');

type Params = {
  placeId: string,
  placesService: $FlowFixMe, // typeof google.maps.places.PlaceService,
  PlacesServiceStatus: $FlowFixMe, // typeof google.maps.places.PlacesServiceStatus,
}

type AddressComponent = {
  types: Array<string>,
  long_name: string,
  short_name: string,
}

type Address = {|
  id: string,
  city: string,
  country: string,
  formattedAddress: string,
  addressNote?: ?string,
  number?: ?string,
  state?: ?string,
  street?: ?string,
  zipCode?: ?string,
|};

const getAddressComponentByType = (
  components: Array<AddressComponent>,
  type: string,
): string => {
  const component = components.find(({ types }) => types.includes(type));
  
  if (component) {
    if (component.long_name) {
      return component.long_name;
    }
    if (component.short_name) {
      return component.short_name;
    }
    return '';
  }
  return '';
};


const getPlaceDetails = ({ placeId, placesService, PlacesServiceStatus }: Params): Promise<Address> => new Promise((resolve, reject) => {

  if (!placesService) {
    return reject(new Error('PlacesService is not initialized'));
  }

  const request = {
    placeId,
    fields: ['address_components', 'formatted_address', 'name', 'types'],
  };

  placesService.getDetails(request, (response, status) => {
    if (status !== PlacesServiceStatus.OK) {
      reject();
      return;
    }

    const { address_components: addressComponents } = response;

    // https://developers.google.com/maps/documentation/geocoding/start#Types
    const country = getAddressComponentByType(addressComponents, 'country');
    const state = getAddressComponentByType(addressComponents, 'administrative_area_level_1') || getAddressComponentByType(addressComponents, 'administrative_area_level_2');
    const city = getAddressComponentByType(addressComponents, 'locality');
    const street = getAddressComponentByType(addressComponents, 'route');
    const number = getAddressComponentByType(addressComponents, 'street_number');
    const zipCode = getAddressComponentByType(addressComponents, 'postal_code');

    const getPlaceName = () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const type of response.types) {
        if (placesTypes.includes(type)) {
          return `${response.name} `;
        }
      }
      return '';
    };

    resolve({
      id: placeId,
      country,
      state,
      city,
      street,
      number,
      zipCode,
      formattedAddress: `${getPlaceName()}${response.formatted_address}`,
      addressNote: '',
    });
  });
});

module.exports.getPlaceDetails = getPlaceDetails;
