import pandas as pd
import numpy as np
import seaborn as sns
from utilsFinal import makeRowForGroup
terrorEU=pd.read_csv('C:\\Users\\Georg\\Desktop\\senbyo.github.io\\ProjectB\\data\\terror_EU_processed_data.csv',encoding='latin-1')

years = range(1970,2017)
terrorEU["Victims"] = terrorEU["Victims"].fillna(0)
attackTypes = terrorEU["AttackType"].value_counts().index
data_needed = terrorEU[["Year","AttackType","Group","Victims"]]
finalDf = pd.DataFrame(columns = ["Year","Attacks",attackTypes[0],attackTypes[1],attackTypes[2],attackTypes[3],attackTypes[4],attackTypes[5],attackTypes[6],attackTypes[7],attackTypes[8],"Group"])
years = range(1970,2017)
for year in years:
#year = years[0]
#split it all into groups per year
    dataForYear = data_needed[data_needed["Year"]==year]
    if(len(dataForYear)!=0):     
        group1_name = "Irish Republican Army (IRA)"
        data_year_group1 = dataForYear[dataForYear["Group"]==group1_name]
        group2_name = "Basque Fatherland and Freedom (ETA)"
        data_year_group2 = dataForYear[dataForYear["Group"]==group2_name]
        group3_name = "Corsican National Liberation Front (FLNC)"
        data_year_group3 = dataForYear[dataForYear["Group"]==group3_name]
        group4_name = "Donetsk People's Republic"
        data_year_group4 = dataForYear[dataForYear["Group"]==group4_name]
        group5_name = "Protestant extremists"
        data_year_group5 = dataForYear[dataForYear["Group"]==group5_name]
        group6_name = "Chechen Rebels"
        data_year_group6 = dataForYear[dataForYear["Group"]==group6_name]
        group7_name = "Ulster Volunteer Force (UVF)"
        data_year_group7 = dataForYear[dataForYear["Group"]==group7_name]
        group8_name = "Ulster Freedom Fighters (UFF)"
        data_year_group8 = dataForYear[dataForYear["Group"]==group8_name]
        group9_name = "Neo-Nazi extremists"
        data_year_group9 = dataForYear[dataForYear["Group"]==group9_name]
        group10_name = "Red Brigades"
        data_year_group10 = dataForYear[dataForYear["Group"]==group10_name]
        group11_name = "First of October Antifascist Resistance Group (GRAPO)"
        data_year_group11 = dataForYear[dataForYear["Group"]==group11_name]
        #do metrics for this year, concat into dataframe
        frames = [data_year_group1, data_year_group2, data_year_group3,data_year_group4,data_year_group5,data_year_group6, data_year_group7, data_year_group8,data_year_group9,data_year_group10, data_year_group11]
        result = pd.concat(frames)
        groupall_row = makeRowForGroup(result,year,attackTypes)
        groupall_row[-1] = "All"
        group1_row = makeRowForGroup(data_year_group1,year,attackTypes,group1_name)
        group2_row = makeRowForGroup(data_year_group2,year,attackTypes,group2_name)
        group3_row = makeRowForGroup(data_year_group3,year,attackTypes,group3_name)
        group4_row = makeRowForGroup(data_year_group4,year,attackTypes,group4_name)
        group5_row = makeRowForGroup(data_year_group5,year,attackTypes,group5_name)
        group6_row = makeRowForGroup(data_year_group6,year,attackTypes,group6_name)
        group7_row = makeRowForGroup(data_year_group7,year,attackTypes,group7_name)
        group8_row = makeRowForGroup(data_year_group8,year,attackTypes,group8_name)
        group9_row = makeRowForGroup(data_year_group9,year,attackTypes,group9_name)
        group10_row = makeRowForGroup(data_year_group10,year,attackTypes,group10_name)
        group11_row = makeRowForGroup(data_year_group11,year,attackTypes,group11_name)

        
        dataframe_forYear = pd.DataFrame([groupall_row,group1_row,group2_row,group3_row,group4_row,group5_row,group6_row,group7_row,group8_row,group9_row,group10_row,group11_row],columns = ["Year","Attacks",attackTypes[0],attackTypes[1],attackTypes[2],attackTypes[3],attackTypes[4],attackTypes[5],attackTypes[6],attackTypes[7],attackTypes[8],"Group"])
    else:
        groupnan_row = np.array([year,0,0,0,0,0,0,0,0,0,0,"No_attacks"])
        dataframe_forYear = pd.DataFrame([groupnan_row,groupnan_row,groupnan_row,groupnan_row,groupnan_row],columns = ["Year","Attacks",attackTypes[0],attackTypes[1],attackTypes[2],attackTypes[3],attackTypes[4],attackTypes[5],attackTypes[6],attackTypes[7],attackTypes[8],"Group"])

    #merge and repeat
    finalDf = finalDf.append(dataframe_forYear)

finalDf.to_csv("'C:\\Users\\Georg\\Desktop\\senbyo.github.io\\ProjectB\\data\\data_breakdown.csv",index = False)

#add feature for all current
