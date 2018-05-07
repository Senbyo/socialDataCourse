import numpy as np

def makeRowForGroup(data,year,attackTypes):
    attacks1_all = len(data["AttackType"])
    attack1_bomb = (data["AttackType"]==attackTypes[0]).sum()
    attack1_assass = (data["AttackType"]==attackTypes[1]).sum()
    attack1_armedass = (data["AttackType"]==attackTypes[2]).sum()
    attack1_infr = (data["AttackType"]==attackTypes[3]).sum()
    attack1_kidn = (data["AttackType"]==attackTypes[4]).sum()
    attack1_unknown = (data["AttackType"]==attackTypes[5]).sum()
    attack1_unarmed = (data["AttackType"]==attackTypes[6]).sum()
    attack1_hostage = (data["AttackType"]==attackTypes[7]).sum()
    attack1_hijack = (data["AttackType"]==attackTypes[8]).sum()
    group1_rowAll = np.array([year,attacks1_all,attack1_bomb,attack1_assass,attack1_armedass,attack1_infr,attack1_kidn,attack1_unknown,attack1_unarmed,attack1_hostage,attack1_hijack,data["Group"].iloc[0]])
    return group1_rowAll