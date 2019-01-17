import config from 'config';
import axios from 'axios';

const JSON5 = require('json5')

export const measurementsService = {
    getMeasurements
};

function getMeasurements({tripID='', driverID='', feature='', baseFeature1='', baseFeature2='', tags=[], driverTypology='', driverMileageMin='', driverMileageMax='', driverYearsMin='', driverYearsMax=''})
{
  let query = []

  //Measurements related
  if (tripID!='')
    query.push({'thing':tripID})
  if (feature!='')
    query.push({'feature':feature})
  if (baseFeature1!='')
    if(baseFeature2!='')
      query.push({'baseFeatures': {"$size":2, "$all":[baseFeature1, baseFeature2]}})
    else
      query.push({'baseFeatures': {"$size":1, "$all":[baseFeature1]}})
  if (tags.length>0)
    query.push({'tags': {"$size":tags.length, "$all":tags}})

  //Driver related
  if (driverID!='')
    query.push({"thing_docs._id":driverID})
  if (driverTypology!='')
    query.push({"thing_docs.metadata.type":driverTypology})
  if (driverMileageMin != '')
    query.push({"thing_docs.metadata.mileage" : {"$gte" : driverMileageMin}})
  if (driverMileageMax != '')
    query.push({"thing_docs.metadata.mileage" : {"$lte" : driverMileageMax}})
  if (driverYearsMin != '')
    query.push({"thing_docs.metadata.years" : {"$gte" : driverYearsMin}})
  if (driverYearsMax != '')
    query.push({"thing_docs.metadata.years" : {"$lte" : driverYearsMax}})

  if (query.length>0)  {
      query = JSON.stringify(query)
      var req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}}, { "$match":{ "$and": ${query}}} ]`
    }
    else {
      var req = `${config.apiUrl}/measurements?aggregator=[{"$lookup": { "from": "things", "localField": "relatedThings", "foreignField": "_id", "as": "thing_docs"}} ]`
    }

    function makeReq(page=1, measurements=[])
    {
      return axios.get(req+`&page=${page}`)
      .then(res => {
        let data = JSON5.parse(res.data)
        var curMeasurements = data.data
        measurements.push(...curMeasurements)

        if (page >= data.totalPages)
          return measurements

        return makeReq(page+1, measurements)
       })
      .catch(err => {
        console.log(err)
      })
    }

    return makeReq()
}
