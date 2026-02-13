import type {
  AircraftSource,
  AircraftSummary,
  AircraftConfigData,
  AircraftPerformanceData,
  AircraftTreeNode,
} from '@/design-system/composites/AircraftSelector';

export const SAMPLE_AIRCRAFT_DATA: AircraftSource[] = [
  {
    label: 'RDM',
    tree: [
      {
        id: 'airbus',
        label: 'Airbus',
        type: 'manufacturer',
        children: [
          {
            id: 'a320-family',
            label: 'A320 Family',
            type: 'family',
            children: [
              {
                id: 'a319',
                label: 'A319-100',
                type: 'type',
                children: [
                  {
                    id: 'a319-cfm56',
                    label: 'CFM56-5B',
                    type: 'engine',
                    children: [
                      { id: 'a319-cfm56-y140', label: 'Y140', type: 'layout', isDefault: true },
                      { id: 'a319-cfm56-c8y132', label: 'C8-Y132', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'a320',
                label: 'A320-200',
                type: 'type',
                children: [
                  {
                    id: 'a320-cfm56-5a',
                    label: 'CFM56-5A',
                    type: 'engine',
                    children: [
                      { id: 'a320-cfm56-5a-y180', label: 'Y180', type: 'layout', isDefault: true },
                      { id: 'a320-cfm56-5a-f12y138', label: 'F12-Y138', type: 'layout' },
                    ],
                  },
                  {
                    id: 'a320-cfm56-5b',
                    label: 'CFM56-5B',
                    type: 'engine',
                    children: [
                      { id: 'a320-cfm56-5b-y180', label: 'Y180', type: 'layout', isDefault: true },
                      { id: 'a320-cfm56-5b-c12y150', label: 'C12-Y150', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'a320neo',
                label: 'A320neo',
                type: 'type',
                children: [
                  {
                    id: 'a320neo-leap1a',
                    label: 'LEAP-1A',
                    type: 'engine',
                    children: [
                      { id: 'a320neo-leap1a-y194', label: 'Y194', type: 'layout', isDefault: true },
                      { id: 'a320neo-leap1a-j8y178', label: 'J8-Y178', type: 'layout' },
                    ],
                  },
                  {
                    id: 'a320neo-pw1100g',
                    label: 'PW1100G',
                    type: 'engine',
                    children: [
                      { id: 'a320neo-pw1100g-y194', label: 'Y194', type: 'layout', isDefault: true },
                    ],
                  },
                ],
              },
              {
                id: 'a321',
                label: 'A321-200',
                type: 'type',
                children: [
                  {
                    id: 'a321-cfm56-5b',
                    label: 'CFM56-5B',
                    type: 'engine',
                    children: [
                      { id: 'a321-cfm56-5b-y220', label: 'Y220', type: 'layout', isDefault: true },
                      { id: 'a321-cfm56-5b-c16y200', label: 'C16-Y200', type: 'layout' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'a330-family',
            label: 'A330 Family',
            type: 'family',
            children: [
              {
                id: 'a330-200',
                label: 'A330-200',
                type: 'type',
                children: [
                  {
                    id: 'a330-200-trent700',
                    label: 'Trent 700',
                    type: 'engine',
                    children: [
                      { id: 'a330-200-trent700-y293', label: 'Y293', type: 'layout', isDefault: true },
                      { id: 'a330-200-trent700-j30w21y222', label: 'J30-W21-Y222', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'a330-300',
                label: 'A330-300',
                type: 'type',
                children: [
                  {
                    id: 'a330-300-trent700',
                    label: 'Trent 700',
                    type: 'engine',
                    children: [
                      { id: 'a330-300-trent700-y335', label: 'Y335', type: 'layout', isDefault: true },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'boeing',
        label: 'Boeing',
        type: 'manufacturer',
        children: [
          {
            id: 'b737-family',
            label: '737 Family',
            type: 'family',
            children: [
              {
                id: 'b737-800',
                label: '737-800',
                type: 'type',
                children: [
                  {
                    id: 'b737-800-cfm56-7b',
                    label: 'CFM56-7B',
                    type: 'engine',
                    children: [
                      { id: 'b737-800-cfm56-7b-y189', label: 'Y189', type: 'layout', isDefault: true },
                      { id: 'b737-800-cfm56-7b-c16y153', label: 'C16-Y153', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'b737-max8',
                label: '737 MAX 8',
                type: 'type',
                children: [
                  {
                    id: 'b737-max8-leap1b',
                    label: 'LEAP-1B',
                    type: 'engine',
                    children: [
                      { id: 'b737-max8-leap1b-y189', label: 'Y189', type: 'layout', isDefault: true },
                      { id: 'b737-max8-leap1b-j16y163', label: 'J16-Y163', type: 'layout' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'b777-family',
            label: '777 Family',
            type: 'family',
            children: [
              {
                id: 'b777-200er',
                label: '777-200ER',
                type: 'type',
                children: [
                  {
                    id: 'b777-200er-ge90',
                    label: 'GE90-94B',
                    type: 'engine',
                    children: [
                      { id: 'b777-200er-ge90-y305', label: 'Y305', type: 'layout', isDefault: true },
                      { id: 'b777-200er-ge90-j42w24y227', label: 'J42-W24-Y227', type: 'layout' },
                    ],
                  },
                ],
              },
              {
                id: 'b777-300er',
                label: '777-300ER',
                type: 'type',
                children: [
                  {
                    id: 'b777-300er-ge90-115b',
                    label: 'GE90-115B',
                    type: 'engine',
                    children: [
                      { id: 'b777-300er-ge90-115b-y396', label: 'Y396', type: 'layout', isDefault: true },
                      { id: 'b777-300er-ge90-115b-j60w52y264', label: 'J60-W52-Y264', type: 'layout' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Custom',
    tree: [],
  },
];

export const AIRCRAFT_CONFIGS: Record<string, { summary: AircraftSummary; config: AircraftConfigData; performance: AircraftPerformanceData }> = {
  'a319-cfm56-y140': {
    summary: { family: 'A319-100', engine: 'CFM56-5B', layout: 'Y140' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 40000, mtw: 70000, mtow: 70000, mlw: 60000, mzfw: 55000, mfc: 20000 },
      cabin: { totalSeats: 140, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 140 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A319-131',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a319-cfm56-c8y132': {
    summary: { family: 'A319-100', engine: 'CFM56-5B', layout: 'C8-Y132' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 40200, mtw: 70000, mtow: 70000, mlw: 60000, mzfw: 55000, mfc: 20000 },
      cabin: { totalSeats: 140, firstSeats: 0, businessSeats: 8, premiumSeats: 0, ecoSeats: 132 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A319-131',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320-cfm56-5a-f12y138': {
    summary: { family: 'A320-200', engine: 'CFM56-5A', layout: 'F12 - Y138' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 42600, mtw: 73500, mtow: 73500, mlw: 64500, mzfw: 61000, mfc: 24210 },
      cabin: { totalSeats: 150, firstSeats: 12, businessSeats: 0, premiumSeats: 0, ecoSeats: 138 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-214',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320-cfm56-5a-y180': {
    summary: { family: 'A320-200', engine: 'CFM56-5A', layout: 'Y180' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 42400, mtw: 73500, mtow: 73500, mlw: 64500, mzfw: 61000, mfc: 24210 },
      cabin: { totalSeats: 180, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 180 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-214',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320-cfm56-5b-y180': {
    summary: { family: 'A320-200', engine: 'CFM56-5B', layout: 'Y180' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 42500, mtw: 73500, mtow: 73500, mlw: 64500, mzfw: 61000, mfc: 24210 },
      cabin: { totalSeats: 180, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 180 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-232',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320-cfm56-5b-c12y150': {
    summary: { family: 'A320-200', engine: 'CFM56-5B', layout: 'C12-Y150' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 42700, mtw: 73500, mtow: 73500, mlw: 64500, mzfw: 61000, mfc: 24210 },
      cabin: { totalSeats: 162, firstSeats: 0, businessSeats: 12, premiumSeats: 0, ecoSeats: 150 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-232',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a320neo-leap1a-y194': {
    summary: { family: 'A320neo', engine: 'LEAP-1A', layout: 'Y194' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 44300, mtw: 79000, mtow: 79000, mlw: 67400, mzfw: 64300, mfc: 26730 },
      cabin: { totalSeats: 194, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 194 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-271N',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
  'a320neo-leap1a-j8y178': {
    summary: { family: 'A320neo', engine: 'LEAP-1A', layout: 'J8-Y178' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 44500, mtw: 79000, mtow: 79000, mlw: 67400, mzfw: 64300, mfc: 26730 },
      cabin: { totalSeats: 186, firstSeats: 0, businessSeats: 8, premiumSeats: 0, ecoSeats: 178 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-271N',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
  'a320neo-pw1100g-y194': {
    summary: { family: 'A320neo', engine: 'PW1100G', layout: 'Y194' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 44300, mtw: 79000, mtow: 79000, mlw: 67400, mzfw: 64300, mfc: 26730 },
      cabin: { totalSeats: 194, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 194 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A320-251N',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
  'a321-cfm56-5b-y220': {
    summary: { family: 'A321-200', engine: 'CFM56-5B', layout: 'Y220' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 48500, mtw: 89000, mtow: 89000, mlw: 77800, mzfw: 75600, mfc: 23700 },
      cabin: { totalSeats: 220, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 220 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A321-231',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a321-cfm56-5b-c16y200': {
    summary: { family: 'A321-200', engine: 'CFM56-5B', layout: 'C16-Y200' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 48800, mtw: 89000, mtow: 89000, mlw: 77800, mzfw: 75600, mfc: 23700 },
      cabin: { totalSeats: 216, firstSeats: 0, businessSeats: 16, premiumSeats: 0, ecoSeats: 200 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A321-231',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a330-200-trent700-y293': {
    summary: { family: 'A330-200', engine: 'Trent 700', layout: 'Y293' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 120600, mtw: 230000, mtow: 230000, mlw: 180000, mzfw: 168000, mfc: 139090 },
      cabin: { totalSeats: 293, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 293 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A330-243',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a330-200-trent700-j30w21y222': {
    summary: { family: 'A330-200', engine: 'Trent 700', layout: 'J30-W21-Y222' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 121500, mtw: 230000, mtow: 230000, mlw: 180000, mzfw: 168000, mfc: 139090 },
      cabin: { totalSeats: 273, firstSeats: 0, businessSeats: 30, premiumSeats: 21, ecoSeats: 222 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A330-243',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'a330-300-trent700-y335': {
    summary: { family: 'A330-300', engine: 'Trent 700', layout: 'Y335' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 124500, mtw: 233000, mtow: 233000, mlw: 185000, mzfw: 173000, mfc: 139090 },
      cabin: { totalSeats: 335, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 335 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'A330-343',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b737-800-cfm56-7b-y189': {
    summary: { family: '737-800', engine: 'CFM56-7B', layout: 'Y189' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 41413, mtw: 79016, mtow: 79016, mlw: 66361, mzfw: 62732, mfc: 26020 },
      cabin: { totalSeats: 189, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 189 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B737-8',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b737-800-cfm56-7b-c16y153': {
    summary: { family: '737-800', engine: 'CFM56-7B', layout: 'C16-Y153' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 41600, mtw: 79016, mtow: 79016, mlw: 66361, mzfw: 62732, mfc: 26020 },
      cabin: { totalSeats: 169, firstSeats: 0, businessSeats: 16, premiumSeats: 0, ecoSeats: 153 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B737-8',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b737-max8-leap1b-y189': {
    summary: { family: '737 MAX 8', engine: 'LEAP-1B', layout: 'Y189' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 45070, mtw: 82191, mtow: 82191, mlw: 69309, mzfw: 65952, mfc: 25816 },
      cabin: { totalSeats: 189, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 189 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B737-8MAX',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
  'b737-max8-leap1b-j16y163': {
    summary: { family: '737 MAX 8', engine: 'LEAP-1B', layout: 'J16-Y163' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 45300, mtw: 82191, mtow: 82191, mlw: 69309, mzfw: 65952, mfc: 25816 },
      cabin: { totalSeats: 179, firstSeats: 0, businessSeats: 16, premiumSeats: 0, ecoSeats: 163 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B737-8MAX',
      globalDeterioration: 1.5,
      deteriorationPerPhase: { taxi: 0.5, takeOff: 1.5, climb: 1.5, cruise: 1.5, descent: 1.5, holding: 1.5, approachAndLanding: 1.5 },
    },
  },
  'b777-200er-ge90-y305': {
    summary: { family: '777-200ER', engine: 'GE90-94B', layout: 'Y305' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 138100, mtw: 297550, mtow: 297550, mlw: 213180, mzfw: 195045, mfc: 171170 },
      cabin: { totalSeats: 305, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 305 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B777-200ER',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b777-200er-ge90-j42w24y227': {
    summary: { family: '777-200ER', engine: 'GE90-94B', layout: 'J42-W24-Y227' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 139500, mtw: 297550, mtow: 297550, mlw: 213180, mzfw: 195045, mfc: 171170 },
      cabin: { totalSeats: 293, firstSeats: 0, businessSeats: 42, premiumSeats: 24, ecoSeats: 227 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B777-200ER',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b777-300er-ge90-115b-y396': {
    summary: { family: '777-300ER', engine: 'GE90-115B', layout: 'Y396' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 167800, mtw: 351535, mtow: 351535, mlw: 251290, mzfw: 237680, mfc: 181280 },
      cabin: { totalSeats: 396, firstSeats: 0, businessSeats: 0, premiumSeats: 0, ecoSeats: 396 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B777-300ER',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
  'b777-300er-ge90-115b-j60w52y264': {
    summary: { family: '777-300ER', engine: 'GE90-115B', layout: 'J60-W52-Y264' },
    config: {
      weights: { weightVariant: 'Basic WV', basic: 169200, mtw: 351535, mtow: 351535, mlw: 251290, mzfw: 237680, mfc: 181280 },
      cabin: { totalSeats: 376, firstSeats: 0, businessSeats: 60, premiumSeats: 52, ecoSeats: 264 },
      cg: { centerOfGravity: 25 },
    },
    performance: {
      source: 'FMS',
      model: 'B777-300ER',
      globalDeterioration: 2.5,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.5, cruise: 2.5, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  },
};

export const getSummaryFromPath = (path: AircraftTreeNode[]): AircraftSummary => {
  const type = path.find(n => n.type === 'type')?.label || 'Unknown';
  const engine = path.find(n => n.type === 'engine')?.label || 'Unknown';
  const layout = path.find(n => n.type === 'layout')?.label || 'Unknown';
  return { family: type, engine, layout };
};

export const getDefaultTechnicalConfig = (): { config: AircraftConfigData; performance: AircraftPerformanceData } => {
  return {
    config: {
      weights: { weightVariant: 'Basic WV', basic: 40000, mtw: 70000, mtow: 70000, mlw: 60000, mzfw: 55000, mfc: 20000 },
      cabin: { totalSeats: 150, firstSeats: 0, businessSeats: 0, premiumSeats: 24, ecoSeats: 126 },
      cg: { centerOfGravity: 28 },
    },
    performance: {
      source: 'FMS',
      model: 'Unknown',
      globalDeterioration: 2.0,
      deteriorationPerPhase: { taxi: 1.0, takeOff: 2.0, climb: 2.0, cruise: 2.0, descent: 2.0, holding: 2.0, approachAndLanding: 2.0 },
    },
  };
};
