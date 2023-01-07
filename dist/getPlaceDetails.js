const {
  placesTypes
} = require('./placesTypes');
const getAddressComponentByType = (components, type) => {
  const component = components.find(({
    types
  }) => types.includes(type));
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
const getPlaceDetails = ({
  placeId,
  placesService,
  PlacesServiceStatus
}) => new Promise((resolve, reject) => {
  if (!placesService) {
    return reject(new Error('PlacesService is not initialized'));
  }
  const request = {
    placeId,
    fields: ['address_components', 'formatted_address', 'name', 'types']
  };
  placesService.getDetails(request, (response, status) => {
    if (status !== PlacesServiceStatus.OK) {
      reject();
      return;
    }
    const {
      address_components: addressComponents
    } = response;

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
      addressNote: ''
    });
  });
});
module.exports.getPlaceDetails = getPlaceDetails;