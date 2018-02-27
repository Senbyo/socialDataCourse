# -*- coding: utf-8 -*-
"""
Created on Fri Feb 27 15:25:30 2018

@author: Marc
"""

import sys
import pandas as pd
import numpy as np
import warnings;

# pathCsvFile = sys.argv[1] # If want to use command line for path
pathCsvFile = 'NYPD_Complaint_Data_Historic.csv'


crimeCsv = pd.read_csv(pathCsvFile)
crimeCsv = crimeCsv[['BORO_NM']] # Only load the borough column.
crimeCsv = crimeCsv.drop([crimeCsv.index[-1]]) #drop 'TBD' last row

manhattanCounter = 0
brooklynCounter = 0
queensCounter = 0
bronxCounter = 0
statenIslandCounter = 0
totalCounter = 0

for index, row in crimeCsv.iterrows():
    borough = row[0]
    if borough == "MANHATTAN":
        manhattanCounter += 1
        totalCounter += 1
    elif borough == "BROOKLYN":
        brooklynCounter += 1
        totalCounter += 1
    elif borough == "QUEENS":
        queensCounter += 1
        totalCounter += 1
    elif borough == "BRONX":
        bronxCounter += 1
        totalCounter += 1
    elif borough == "STATEN ISLAND":
        statenIslandCounter += 1
        totalCounter += 1

manhattanFraction = manhattanCounter/totalCounter
brooklynFraction = brooklynCounter/totalCounter
queensFraction = queensCounter/totalCounter
bronxFraction = bronxCounter/totalCounter
statenIslandFraction = statenIslandCounter/totalCounter

# Create the new data frame.
new_dataFrame = pd.DataFrame(
    {
        "BORO_NM": ["MANHATTAN", "BROOKLYN", "QUEENS", "BRONX", "STATEN ISLAND"],
        "FoTC": [manhattanFraction, brooklynFraction, queensFraction, bronxFraction, statenIslandFraction]
    }
)

new_dataFrame.to_csv('processed.csv', index = False)
