// @flow strict

const placeIdFromText = async ({ text, apiKey }: { text: string, apiKey: string }): Promise<?string> => {

  const searchResult = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${apiKey}&input=${encodeURI(text)}&inputtype=textquery`);
  if (searchResult.status !== 200) {
    // TODO handle error
    return null;
  }

  const result = await searchResult.json();

  if (result.candidates.length) {
    const { place_id } = result.candidates[0];
    return place_id;
  }

  return null;
};

module.exports.placeIdFromText = placeIdFromText;