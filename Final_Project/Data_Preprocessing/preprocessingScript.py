import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
import numpy as np
plt.style.use('fivethirtyeight')
import plotly.offline as py
py.init_notebook_mode(connected=True)
import plotly.graph_objs as go
import plotly.tools as tls
from matplotlib import animation,rc
import io
import base64
from IPython.display import HTML, display
import warnings
warnings.filterwarnings('ignore')
from scipy.misc import imread
import codecs
from subprocess import check_output
import datetime

terror=pd.read_csv('globalterrorismdb_0617dist.csv',encoding='ISO-8859-1')
terror.rename(columns={'iyear':'Year','imonth':'Month','iday':'Day','country_txt':'Country','region_txt':'Region','attacktype1_txt':'AttackType','target1':'Target','nkill':'Killed','nwound':'Wounded','summary':'Summary','gname':'Group','targtype1_txt':'Target_type','weaptype1_txt':'Weapon_type','motive':'Motive','city':'City','latitude':'Latitude', 'longitude':'Longitude'},inplace=True)
terror=terror[['Year','Month','Day','Country','Region','City','Latitude','Longitude','AttackType','Killed','Wounded','Target','Summary','Group','Target_type','Weapon_type','Motive']]
terror['Victims']=terror['Killed']+terror['Wounded']

terror.isnull().sum()
terror = terror.dropna(axis=0, how = 'any',subset = ['Longitude'])
terror = terror.dropna(axis=0, how = 'any',subset = ['Latitude'])

#make feature datetime object
terror["Month"] = terror["Month"].replace(0,1)
terror["Day"] = terror["Day"].replace(0,1)
terror["Year"] = terror["Year"].replace(0,1)

terror['Date'] = terror[['Year', 'Month', 'Day']].apply(lambda s : datetime.datetime(*s),axis = 1)
terror=terror[['Date','Country','Region','City','Latitude','Longitude','AttackType','Victims','Killed','Target','Summary','Group','Target_type','Weapon_type','Motive','Year','Month','Day']]
terror['Date'] = terror['Date'].dt.date

terror["AttackType"] = terror["AttackType"].replace("Hostage Taking (Kidnapping)","Kidnapping")
terror["AttackType"] = terror["AttackType"].replace("Hostage Taking (Barricade Incident)","Hostage Taking")
terror["AttackType"] = terror["AttackType"].replace("Facility/Infrastructure Attack","Infrastructure Attack")

terror = terror.sort_values(['Date'])
terror.to_csv("terror_all_processed_data.csv",index=False)


#make a subset for europe
terrorEU = terror[terror['Region'].str.contains("Europe")]
terrorEU.to_csv("terror_EU_processed_data.csv",index=False)
