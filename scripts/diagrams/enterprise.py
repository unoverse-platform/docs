"""Regenerates both enterprise diagrams from one frame, so they cannot drift apart:
images/architecture-kubernetes.svg (one copy) and images/architecture-active-active.svg (two zones).
Run from packages/docs: python3 scripts/diagrams/enterprise.py

Everything outside the unoverse namespace is drawn once, here, for both. Only the namespace
differs. The numbers mean the same thing on both; 9 exists only on the two-zone one.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from arch import *

K="#326ce5"; CELL="#6D5DF6"; GREY="#8b93a5"; ENT="#0f172a"
LIFT = 40
RH = 46
R1 = 323                                    # the row users enter on
ACC_Y, REL_Y = 405, 569                     # support -> cluster access, release -> registry
SERV_YS = [R1, ACC_Y, 487, REL_Y]
RIGHT_YS = [R1, 403, 483, 563]
TOP = 208
NS_BOT = 640
CL_Y, CL_BOT = 166, NS_BOT + 22
ENT_Y = 124
BOT_Y = CL_BOT + 28

def w_of(items, minw):
    return max(fitbox(0,0,t,s,None,minw=minw)[1] for t,s in items)
_,_,bh = fitbox(0,0,"x",["y"])
_,_,dh = fitbox(0,0,"x",["y","z"])

# ── The two namespaces. Each draws itself and says where the frame's lines attach. ──

def one_copy(NX):
    b = []; NW = 600
    b.append(boundary(NX,TOP,NW,NS_BOT-TOP,"unoverse · Unoverse-managed application",CELL,dash="4 4",bg="#fafafc"))
    HX, HW = NX+18, NW-36
    R2, R3 = R1 + 54, R1 + 108
    HB = R3 + RH/2 + 14
    b.append(host(HX,TOP+36,HW,HB-TOP-36,"Application","signed images · non-root · network closed by default","kubernetes"))
    IW = NW-64; SXX = NX+32; HALF = (IW-16)/2
    b.append(svc(SXX,R1-RH/2,IW,"unoverse","API · MCP · workflow engine · runs the nodes","public",h=RH))
    b.append(svc(SXX,R2-RH/2,HALF,"Canvas","the app users work in","public",h=RH))
    b.append(svc(SXX+HALF+16,R2-RH/2,HALF,"Memory","profiles and tasks","internal",h=RH))
    b.append(svc(SXX,R3-RH/2,HALF,"Spatial ML","the semantic map · one copy","internal",h=RH))
    b.append(svc(SXX+HALF+16,R3-RH/2,HALF,"Documents","reads and parses files · early","internal",h=RH))
    DATA_GY = HB + 22; DATA_Y = DATA_GY + 36
    b.append(boundary(HX,DATA_GY,HW,NS_BOT-18-DATA_GY,"Data · this cell only",GREY,dash="4 4",bg="#ffffff"))
    DW = (HW - 36 - 22) / 2
    VKX = HX + 18; PGX = VKX + DW + 22
    b.append(fitbox(VKX,DATA_Y,"Valkey (Redis)",["cache and live events","one per cell"],"database",minw=DW)[0])
    b.append(fitbox(PGX,DATA_Y,"Postgres",["all cell data · 1 copy","backed up every 5 min + nightly"],"postgres",minw=DW)[0])
    return dict(parts=b, NW=NW, into=[(SXX,R1)], out=(SXX+IW,R1),
                keys=(VKX,DW,DATA_Y+dh), backup=(PGX,DW,DATA_Y+dh))

def two_zones(NX):
    b = []
    ZH = 152; ZA_Y = R1 - 59; ZB_Y = ZA_Y + ZH + 20
    ZB_R1 = ZB_Y + 59
    HALF = 200; ZW = 2*HALF + 16 + 36; ZX = NX + 18
    SBW, SGAP = 232, 56
    SX = ZX + ZW + 48; SW = 18 + SBW + SGAP + SBW + 18
    NW = (SX + SW + 18) - NX
    b.append(boundary(NX,TOP,NW,NS_BOT-TOP,"unoverse · Unoverse-managed application",CELL,dash="4 4",bg="#fafafc"))
    for zy, name in [(ZA_Y,"Zone A · machine 1 · active"),(ZB_Y,"Zone B · machine 2 · active")]:
        r1, r2 = zy + 59, zy + 113
        b.append(boundary(ZX,zy,ZW,ZH,name,K,dash="4 4",bg="#ffffff"))
        sx = ZX + 18
        b.append(svc(sx,r1-RH/2,HALF,"unoverse","API · MCP · engine · nodes","public",h=RH))
        b.append(svc(sx+HALF+16,r1-RH/2,HALF,"Canvas","the app users work in","public",h=RH))
        b.append(svc(sx,r2-RH/2,HALF,"Memory","profiles and tasks","internal",h=RH))
        b.append(svc(sx+HALF+16,r2-RH/2,HALF,"Documents","reads and parses files · early","internal",h=RH))
    b.append(text(ZX, NS_BOT-18, "Either zone alone carries the full load: a zone can be lost without stopping service.", 11.5, 400, MUTE))
    S_Y, S_BOT = ZA_Y, ZB_Y + ZH
    b.append(boundary(SX,S_Y,SW,S_BOT-S_Y,"Shared by both zones · machine 3",GREY,dash="4 4",bg="#ffffff"))
    ROW1 = S_Y + 30 + ((S_BOT - S_Y - 30) - (2*dh + 24)) / 2; ROW2 = ROW1 + dh + 24
    LX, RX = SX + 18, SX + 18 + SBW + SGAP
    b.append(fitbox(LX,ROW1,"Spatial ML",["one shared copy","models in backup storage"],None,minw=SBW)[0])
    b.append(fitbox(RX,ROW1,"Valkey (Redis)",["main + automatic standby","routes each conversation"],"database",minw=SBW)[0])
    b.append(fitbox(LX,ROW2,"Postgres · standby",["in zone B · live copy","takes over in minutes"],"postgres",minw=SBW)[0])
    b.append(fitbox(RX,ROW2,"Postgres · primary",["in zone A","takes every write"],"postgres",minw=SBW)[0])
    PY = ROW2 + dh/2
    b.append(edge([(RX,PY),(LX+SBW,PY)])); b.append(step(LX+SBW+SGAP/2,PY-18,9))
    return dict(parts=b, NW=NW, into=[(ZX+18,R1),(ZX+18,ZB_R1)], out=(NX+NW,R1),
                keys=(LX,SBW,S_BOT), backup=(RX,SBW,ROW2+dh))

# ── The frame, the same for both ──

def provide_panel(x, y, w, items):
    """WHAT YOU PROVIDE: what the enterprise's architects and infrastructure team supply, in
    plain words, two columns. Returns the parts and the panel's height."""
    b = []; LH = 22; COL = (len(items) + 1) // 2; h = 46 + COL * LH + 10
    b.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#ffffff" stroke="{ENT}" stroke-width="1.5"/>')
    b.append(text(x+18, y+28, "CUSTOMER-PROVIDED INFRASTRUCTURE", 11.5, 700, ENT, ls=1.2))
    # RESPONSIBILITY: who manages each area, matched to the outlines above.
    LEG = [(ENT, "6 5", "Customer-managed"),
           (GREY, "4 4", "Customer-managed, or managed by Unoverse on request"),
           (CELL, "4 4", "Unoverse-managed application")]
    lx = x + w - 18
    for colour, dash, label in reversed(LEG):
        tw = len(label) * 6.6
        lx -= tw
        b.append(text(lx, y+28, label, 11.5, 500, INK))
        lx -= 30
        b.append(f'<rect x="{lx}" y="{y+18}" width="22" height="13" rx="3" fill="none" stroke="{colour}" stroke-width="1.5" stroke-dasharray="{dash}"/>')
        lx -= 22
    half = (w - 36) / 2
    for i, (head, rest) in enumerate(items):
        cx = x + 18 + (i // COL) * half; cy = y + 54 + (i % COL) * LH
        b.append(f'<text x="{cx}" y="{cy}" font-family="{F}" font-size="12.5" fill="{INK}">'
                 f'<tspan font-weight="700">{esc(head)}</tspan><tspan fill="{MUTE}">  {esc(rest)}</tspan></text>')
    return b, h

def sizing_panel(x, y, w, capacity, services):
    """SIZING: estimated capacity (left) and what each service is given on the machine (right,
    from deploy/helm/unoverse/values.yaml requests and limits). Returns the parts and height."""
    b = []; LH = 22; rows = max(len(capacity), len(services)); h = 46 + rows * LH + 10
    b.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="#ffffff" stroke="{ENT}" stroke-width="1.5"/>')
    half = (w - 36) / 2; lx = x + 18; rx = x + 18 + half
    b.append(text(lx, y+28, "ESTIMATED CAPACITY · CONFIRMED DURING YOUR PILOT", 11.5, 700, ENT, ls=1.2))
    for i, (head, rest) in enumerate(capacity):
        b.append(f'<text x="{lx}" y="{y+54+i*LH}" font-family="{F}" font-size="12.5" fill="{INK}">'
                 f'<tspan font-weight="700">{esc(head)}</tspan><tspan fill="{MUTE}">  {esc(rest)}</tspan></text>')
    b.append(text(rx, y+28, "RESOURCES PER SERVICE", 11.5, 700, ENT, ls=1.2))
    head, body = services[0], services[1:]
    cols = [rx, rx + 160, rx + 320, rx + 430][:len(head)]
    for j, cell in enumerate(head):
        b.append(text(cols[j], y + 54, cell, 11, 700, MUTE, ls=0.6))
    for i, row in enumerate(body):
        cy = y + 54 + (i + 1) * LH
        total = row[0].startswith("Total")
        for j, cell in enumerate(row):
            b.append(text(cols[j], cy, cell, 12.5, 700 if j == 0 or total else 400, INK if j == 0 or total else MUTE))
    return b, h

def draw(cell_fn, title, cluster_label, provide, sizing, out_path):
    b = []
    UNO = [("Support engineers",["no standing access"]), ("Release",["signed chart and images"])]
    UW = w_of(UNO, 220)
    b.append(boundary(24,ACC_Y-bh/2-38,UW+36,(REL_Y+bh/2+18)-(ACC_Y-bh/2-38),"Unoverse (vendor)",GREY,dash="4 4"))
    for (t,s),cy in zip(UNO,[ACC_Y,REL_Y]):
        b.append(fitbox(42,cy-bh/2,t,s,None,minw=UW)[0])
    UR = 42 + UW

    EX = UR + 56
    PEO = ("Users",["browser · AI assistants"])
    PW = w_of([PEO], 200)
    PX = EX + 22; PR = PX + PW
    CLX = PR + 112
    PSX = CLX + 22
    SERV = [("Ingress",["HTTPS · WebSockets, 1-hour timeout"]),
            ("Cluster access",["role-based · every action logged"]),
            ("Policy engine",["only signed images run"]),
            ("Registry and GitOps",["mirror of our release · approved upgrades"])]
    BW = w_of(SERV, 250); BX = PSX + 18; PSW = BW + 36
    NX = PSX + PSW + 56
    cell = cell_fn(NX)
    NW = cell["NW"]
    CL_R = NX + NW + 22
    BUSX = CL_R + 34
    RCX = CL_R + 92
    RIGHT = [("Identity provider",["sign-in · roles"]),
             ("AI gateway",["every model call"]),
             ("Core systems",["integrations through nodes"]),
             ("Security logs",["audit trail · enterprise SIEM"])]
    RW_ = w_of(RIGHT, 240)
    ENT_R = RCX + RW_ + 22
    ENT_BOT = BOT_Y + bh + 22

    b.append(boundary(EX,ENT_Y,ENT_R-EX,ENT_BOT-ENT_Y,"Enterprise environment · customer-managed",ENT))
    b.append(boundary(CLX,CL_Y,CL_R-CLX,CL_BOT-CL_Y,cluster_label,K))
    b.append(fitbox(PX,R1-bh/2,*PEO,None,minw=PW)[0])
    b.append(boundary(PSX,TOP,PSW,NS_BOT-TOP,"Platform · customer or Unoverse",GREY,dash="4 4",bg="#fafafc"))
    for (t,s),cy in zip(SERV,SERV_YS):
        b.append(fitbox(BX,cy-bh/2,t,s,None,minw=BW)[0])
    b += cell["parts"]
    for (t,s),cy in zip(RIGHT,RIGHT_YS):
        b.append(fitbox(RCX,cy-bh/2,t,s,None,minw=RW_)[0])

    KX, KW, KTOP = cell["keys"]; PGX, PGW, PBOT = cell["backup"]
    b.append(fitbox(KX,BOT_Y,"Keys and secrets",["held in the enterprise vault"],None,minw=KW)[0])
    b.append(fitbox(PGX,BOT_Y,"Backup storage",["continuous · encrypted"],None,minw=PGW)[0])
    BNX = PX; BNW = KX - 28 - BNX
    b.append(f'<rect x="{BNX}" y="{BOT_Y}" width="{BNW}" height="{bh}" rx="10" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1.5"/>')
    b.append(text(BNX+18, BOT_Y+25, "No inbound connection from Unoverse. No standing vendor access.", 13, 600, "#4c1d95"))
    b.append(text(BNX+18, BOT_Y+43, "Model calls go through the enterprise AI gateway. Other outbound calls only to an approved list.", 12.5, 400, "#5b21b6"))

    # 1 users come in; the ingress reaches every copy of unoverse
    b.append(edge([(PR,R1),(BX,R1)],"HTTPS",lx=PR+64,ly=R1)); b.append(step(PR+16,R1,1))
    into = cell["into"]
    b.append(edge([(BX+BW,R1),into[0]]))
    if len(into) > 1:
        FX = NX - 26
        b.append(f'<path d="M{FX} {R1} L{FX} {into[-1][1]}" fill="none" stroke="{EDGE}" stroke-width="1.6"/>')
        for x, y in into[1:]:
            b.append(edge([(FX,y),(x,y)]))
    # 6 support only when the enterprise approves; 3 a release is pulled, never pushed
    b.append(edge([(UR,ACC_Y),(BX,ACC_Y)],"enterprise-approved only",lx=(UR+CLX)/2+20,ly=ACC_Y,dashed=True)); b.append(step(UR+22,ACC_Y,6))
    b.append(edge([(UR,REL_Y),(BX,REL_Y)],"pulled · signed",lx=(UR+CLX)/2+20,ly=REL_Y,dashed=True)); b.append(step(UR+22,REL_Y,3))
    b.append(edge([(BX+BW,REL_Y),(NX,REL_Y)]))
    # 2 4 5 7 everything unoverse calls leaves through one trunk
    OX, OY = cell["out"]
    b.append(f'<path d="M{BUSX} {R1} L{BUSX} {RIGHT_YS[-1]}" fill="none" stroke="{EDGE}" stroke-width="1.6"/>')
    b.append(edge([(OX,OY),(RCX,OY)]))
    for y in RIGHT_YS[1:]:
        b.append(edge([(BUSX,y),(RCX,y)]))
    for y,n in zip(RIGHT_YS,[2,4,5,7]):
        b.append(step((BUSX+RCX)/2+2,y,n))
    # keys up into the cell, 8 backups down out of it
    KC = KX + KW/2; PC = PGX + PGW/2
    b.append(edge([(KC,BOT_Y),(KC,KTOP)]))
    b.append(edge([(PC,PBOT),(PC,BOT_Y)])); b.append(step(PC+18,(CL_BOT+BOT_Y)/2+2,8))

    pp, ph = provide_panel(EX, ENT_BOT + 20, ENT_R - EX, provide)
    b += pp
    sp, sh = sizing_panel(EX, ENT_BOT + 20 + ph + 16, ENT_R - EX, *sizing)
    b += sp
    W = ENT_R + 26; H = ENT_BOT + 20 + ph + 16 + sh + 26 - LIFT
    pathlib.Path(out_path).write_text(
      page(W, H, title, "kubernetes", K, f'<g transform="translate(0,-{LIFT})">'+"".join(b)+"</g>",
           symbols(["kubernetes","postgres","database"])))
    print("wrote", out_path, W, H)

# What the enterprise supplies. Sizes are the recommended production sizes; capacity is on the
# sizing sheet, measured, never on a drawing.
COMMON = [("Backup storage", "object storage: S3, Azure Blob, Google Cloud or on-premises · about 50 GB to start"),
          ("One address", "a DNS name with an HTTPS certificate"),
          ("Sign-in", "Entra or any OIDC · roles as set out in the access-control guide"),
          ("AI", "your AI gateway, or model API keys"),
          ("Outbound", "an approved list: AI, our release or your mirror"),
          ("Platform services", "customer-managed, or managed by Unoverse on request")]

# Sizing. Capacity is an ESTIMATE until measured: one engine is one Node.js process (~one core);
# a conversation turn is ~6 steps and 2.7 AI calls, ~11 s mostly spent waiting on the model
# (measured from real runs, 2026-09-25); n8n publishes 16 requests/s for a single instance on
# trivial workflows with no AI calls. Per-service figures are the chart's requests and limits.
# Memory is reserved to maximum (the chart's request and limit).
SERVICES = [("SERVICE", "MEMORY", "DISK"),
            ("unoverse", "1 to 4 GB", "none"),
            ("Memory", "0.25 to 1 GB", "none"),
            ("Canvas", "0.03 to 0.25 GB", "none"),
            ("Spatial ML", "0.5 to 4 GB", "5 GB"),
            ("Documents (early)", "1 to 6 GB", "10 GB"),
            ("Valkey", "0.06 to 0.5 GB", "2 GB"),
            ("Postgres", "0.5 to 2 GB", "10 GB and up"),
            ("Total", "3.3 to 17.8 of 32 GB", "27 GB and up")]
# Cloud cost: list prices 2026-09-25, Western Europe, 8 vCPU / 32 GB (AWS m7g.2xlarge $266,
# 1-year $176; Azure D8ps_v5 $269, 1-year $158), plus disks, backup storage, and for active-active
# the managed Kubernetes fee ($73) and a load balancer. Excludes AI usage.
LASTING = [("Storage", "~70 KB per turn · keep step records 30 days"),
           ("AI usage", "set by each experience's design · the same wherever hosted")]

draw(one_copy, "unoverse: single box",
     "One machine · 8 vCPU · 32 GB RAM · 200 GB SSD · encrypted at rest · enterprise keys",
     [("1 Linux machine", "8 vCPU · 32 GB RAM · 200 GB SSD (minimum 4 vCPU · 16 GB)")] + COMMON,
     ([("Turns", "5 to 10 a second · about 20,000 to 35,000 an hour"),
       ("In progress", "about 50 to 100 turns at once"),
       ("People", "about 300 to 600 chatting actively · thousands signed in")] + LASTING
      + [("Cloud cost", "AWS or Azure, about $290 a month · about $190 with a 1-year commitment")],
      SERVICES),
     "images/architecture-kubernetes.svg")
draw(two_zones, "unoverse: active-active, two zones",
     "Kubernetes · 3 machines across 2 zones · each 8 vCPU · 32 GB RAM · 200 GB SSD · encrypted at rest",
     [("3 machines, 2 zones", "each 8 vCPU · 32 GB RAM · 200 GB SSD"),
      ("Load balancer", "WebSockets, 1-hour idle timeout")] + COMMON,
     ([("3 machines, both zones up", "10 to 20 turns a second · about 40,000 to 70,000 an hour"),
       ("One zone lost", "5 to 10 turns a second · service continues"),
       ("In progress", "about 100 to 200 turns at once"),
       ("People", "about 600 to 1,200 chatting actively · thousands signed in"),
       ("To grow", "each extra machine adds 5 to 10 turns a second")] + LASTING
      + [("Cloud cost", "AWS or Azure, about $950 to $1,000 a month · $650 to $700 with a 1-year commitment")],
      [("SERVICE", "MEMORY", "DISK", "MACHINE"),
       ("unoverse", "1 to 4 GB", "none", "1 and 2"),
       ("Memory", "0.25 to 1 GB", "none", "1 and 2"),
       ("Canvas", "0.03 to 0.25 GB", "none", "1 and 2"),
       ("Documents (early)", "1 to 6 GB", "10 GB", "1 and 2"),
       ("Spatial ML", "0.5 to 4 GB", "5 GB", "3"),
       ("Valkey", "0.06 to 0.5 GB", "2 GB", "3"),
       ("Postgres", "0.5 to 2 GB", "10 GB and up", "each copy"),
       ("Total per zone", "2.3 to 11.3 of 32 GB", "10 GB")]),
     "images/architecture-active-active.svg")
