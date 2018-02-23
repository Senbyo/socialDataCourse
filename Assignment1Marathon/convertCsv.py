# -*- coding: utf-8 -*-
"""
Created on Fri Feb 23 08:30:30 2018

@author: Georg
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import linregress
import pylab

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
print(get_min('1:23:45'))

men['Time'] = men['Time'].apply(get_min)
women['Time'] = women['Time'].apply(get_min)


men.to_csv('processed_men.csv',index = False)
women.to_csv('processed_women.csv',index = False)

#####
men_pr = pd.read_csv('processed_men.csv')
women_pr = pd.read_csv('processed_women.csv')

#calculate the a and b in y = ax+b
a,b = np.polyfit(men_pr["Year"], men_pr["Time"], 1)
aW,bW =  np.polyfit(women_pr["Year"], women_pr["Time"], 1)
plt.ylim(-1.0, 200.0)
plt.plot(men_pr["Year"][0], aW * men_pr["Year"][10] + bW, color='red')

l = linregress(men_pr["Year"],men_pr["Time"]) #x and y are arrays or lists.

""" for merging the data
men_pr = men_pr.rename(columns={'Time' : 'TimeM'})
women_pr = women_pr.rename(columns={'Time' : 'TimeW'})
men_pr['TimeW'] = women_pr['TimeW'] 
men_pr = men_pr.fillna(0)

men_pr.to_csv('all.csv',index = False)
"""