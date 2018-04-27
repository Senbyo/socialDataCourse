import copyshapes
import countries

def getCountry(coord):
    copyshapes.filter_file(
            lambda x: x.GetField('REGION') == 150,
            'TM_WORLD_BORDERS-0.3.shp', 'EUROPE.shp')
    
    cc = countries.CountryChecker('TM_WORLD_BORDERS-0.3.shp')
    country = cc.getCountry(countries.Point(coord[0], coord[1]))
    return country


