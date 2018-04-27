import copyshapes
import countries

def getCoord(coord):
    copyshapes.filter_file(
            lambda x: x.GetField('REGION') == 150,
            'TM_WORLD_BORDERS-0.3.shp', 'EUROPE.shp')
    
    cc = countries.CountryChecker('TM_WORLD_BORDERS-0.3.shp')
    return cc.getCountry(countries.Point(coord[0], coord[1]))


