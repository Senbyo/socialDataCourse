# -*- coding: utf-8 -*-
"""
Created on Fri Feb 23 08:30:30 2018

@author: Georg
"""

import pandas as pd
import numpy as np
import warnings; 


men = pd.read_csv('data_mens_open.csv')
men = men[['Year','Time']]
men = men.drop([men.index[-1]]) #drop 'TBD' last row


women = pd.read_csv('data_womens_open.csv')
women = women[['Year','Time']]
women = women.drop([women.index[-1]])


def get_min(time_str):
    h, m, s = time_str.split(':')
    return int(h) * 60 + int(m) + int(int(s)/60)

#testing
print(get_sec('1:23:45'))
print(get_sec('0:04:15'))
print(get_sec('0:00:25'))

men['Time'] = men['Time'].apply(get_min)
women['Time'] = women['Time'].apply(get_min)


men.to_csv('processed_men.csv',index = False)
women.to_csv('processed_women.csv',index = False)