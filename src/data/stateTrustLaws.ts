import { StateTrustLaw } from '../types/trustLaws';

// Sample data for prototype states - Top tier asset protection jurisdictions
// Data compiled from public sources including state statutes, bar associations, and legal research databases
// Last research date: December 2024
// DISCLAIMER: This is educational information only. Consult a qualified attorney for legal advice.

export const stateTrustLaws: StateTrustLaw[] = [
  // TOP TIER STATES
  {
    state: 'South Dakota',
    stateCode: 'SD',
    overallScore: 9.5,
    tier: 'top',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://sdlegislature.gov/Statutes/Codified_Laws/DisplayStatute.aspx?Type=Statute&Statute=55',
      'https://www.uniformlaws.org/committees/community-home?CommunityKey=193ff839-7955-4846-8f3c-ce74ac23938d'
    ],
    highlights: [
      'No state income tax on trust income',
      'No rule against perpetuities (dynasty trusts)',
      'Strongest DAPT protections in the nation',
      '2-year statute of limitations for creditors'
    ],
    criteria: {
      assetProtection: {
        score: 10,
        summary: 'Industry-leading asset protection statutes',
        details: 'South Dakota has consistently been ranked #1 for asset protection trusts. The state has no state income tax, no rule against perpetuities, and robust DAPT (Domestic Asset Protection Trust) legislation. The state actively updates its trust laws to maintain its competitive advantage.'
      },
      selfSettledTrusts: {
        score: 10,
        allowed: true,
        summary: 'Full DAPT authorization since 2005',
        details: 'South Dakota permits self-settled spendthrift trusts where the grantor can be a beneficiary. The trust must have a qualified SD trustee, and distributions are at the trustee\'s discretion. No minimum funding requirement.'
      },
      statuteOfLimitations: {
        score: 9,
        years: 2,
        summary: '2-year statute of limitations',
        details: 'Creditors have only 2 years from the date of transfer to challenge. For pre-existing creditors, the period is the later of 2 years from transfer or 6 months after discovery (but not more than 2 years). This is among the shortest windows in the nation.'
      },
      domesticForeignRules: {
        score: 9,
        summary: 'Favorable recognition of foreign trusts',
        details: 'South Dakota recognizes and will enforce foreign trust judgments with proper procedure. The state allows trusts established elsewhere to migrate to SD, and provides clear procedures for trust decanting and modification.'
      },
      taxTreatment: {
        score: 10,
        hasStateTax: false,
        summary: 'No state income tax',
        details: 'South Dakota has no state income tax, no capital gains tax, and no inheritance tax. Trust income is not taxed at the state level regardless of source. This makes SD particularly attractive for high-net-worth individuals.'
      },
      spendthriftProvisions: {
        score: 10,
        summary: 'Comprehensive spendthrift protections',
        details: 'SD provides robust spendthrift trust provisions protecting beneficiary interests from creditors. These protections extend to both mandatory and discretionary distributions. Exception creditors (child support, alimony) have limited access.'
      },
      privacyProtections: {
        score: 9,
        summary: 'Strong trust privacy provisions',
        details: 'Trust documents are not filed with any state agency or court (unless litigation arises). Private trust companies can be formed with minimal disclosure. Trust proceedings can be conducted privately.'
      },
      healthcareSpecific: {
        score: 8,
        summary: 'Supports special needs and healthcare trusts',
        details: 'SD recognizes special needs trusts that preserve Medicaid eligibility. Healthcare trusts can be structured to fund medical expenses while maintaining asset protection. No specific medical trust statutes but general trust laws are flexible.'
      }
    }
  },
  {
    state: 'Nevada',
    stateCode: 'NV',
    overallScore: 9.2,
    tier: 'top',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://www.leg.state.nv.us/NRS/NRS-166.html',
      'https://www.nvbar.org/resources/'
    ],
    highlights: [
      'No state income tax',
      '2-year statute of limitations',
      'Strong DAPT protections',
      '365-year rule against perpetuities'
    ],
    criteria: {
      assetProtection: {
        score: 9,
        summary: 'Excellent asset protection framework',
        details: 'Nevada\'s Spendthrift Trust Act (NRS 166) provides comprehensive asset protection. The state pioneered DAPT legislation in 1999 and continues to enhance its trust laws. Assets transferred to a Nevada trust are protected from most creditors.'
      },
      selfSettledTrusts: {
        score: 9,
        allowed: true,
        summary: 'DAPT authorized since 1999',
        details: 'Nevada was the second state (after Alaska) to authorize DAPTs. The settlor can be a discretionary beneficiary. Requires a Nevada trustee and some trust assets in Nevada. 2-year fraudulent transfer lookback.'
      },
      statuteOfLimitations: {
        score: 9,
        years: 2,
        summary: '2-year limitation period',
        details: 'Creditors must bring claims within 2 years of the transfer to the trust. For creditors whose claims arose after the transfer, the period is 2 years from when the claim arose. This is among the most protective statutes nationally.'
      },
      domesticForeignRules: {
        score: 8,
        summary: 'Good interstate recognition',
        details: 'Nevada courts generally honor trust provisions from other states. The state provides mechanisms for trusts to migrate to Nevada and for Nevada trusts to appoint out-of-state trustees in certain capacities.'
      },
      taxTreatment: {
        score: 10,
        hasStateTax: false,
        summary: 'No state income tax',
        details: 'Nevada has no state income tax, no franchise tax on trusts, no inheritance tax, and no estate tax. Trust income from any source is not subject to state taxation. Business-friendly environment for trust administration.'
      },
      spendthriftProvisions: {
        score: 9,
        summary: 'Strong spendthrift clause enforcement',
        details: 'Nevada strongly enforces spendthrift provisions. The state\'s trust code provides that a beneficiary\'s interest cannot be transferred, and creditors cannot reach the interest until distribution. Exception creditors are limited.'
      },
      privacyProtections: {
        score: 9,
        summary: 'High privacy standards',
        details: 'Trust agreements are private documents in Nevada. No public registration required. Trust proceedings can be sealed. Nevada law protects trustee and beneficiary information from disclosure in most circumstances.'
      },
      healthcareSpecific: {
        score: 7,
        summary: 'Standard healthcare trust provisions',
        details: 'Nevada recognizes healthcare trusts and special needs trusts. Medical savings trusts have some tax advantages. No specific medical tourism or international healthcare trust provisions but general laws are flexible.'
      }
    }
  },
  {
    state: 'Delaware',
    stateCode: 'DE',
    overallScore: 9.0,
    tier: 'top',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://delcode.delaware.gov/title12/index.html',
      'https://www.delawaretrustonline.com/'
    ],
    highlights: [
      'Premier trust jurisdiction with sophisticated laws',
      'Directed trust statutes',
      'No rule against perpetuities',
      'Court of Chancery expertise'
    ],
    criteria: {
      assetProtection: {
        score: 9,
        summary: 'Sophisticated asset protection laws',
        details: 'Delaware has one of the most developed trust law systems in the country. The Delaware Qualified Dispositions in Trust Act provides strong asset protection. The state\'s Court of Chancery offers expert trust jurisprudence.'
      },
      selfSettledTrusts: {
        score: 8,
        allowed: true,
        summary: 'Qualified Dispositions in Trust Act',
        details: 'Delaware permits DAPTs under its Qualified Dispositions in Trust Act (12 Del. C. § 3570-3576). Requires a qualified trustee in Delaware. The settlor can retain certain powers without defeating asset protection.'
      },
      statuteOfLimitations: {
        score: 8,
        years: 4,
        summary: '4-year limitation period',
        details: 'Delaware provides a 4-year statute of limitations for challenging transfers to a trust. While longer than SD or NV, Delaware\'s sophisticated court system and predictable jurisprudence provide certainty.'
      },
      domesticForeignRules: {
        score: 9,
        summary: 'Excellent multi-jurisdictional flexibility',
        details: 'Delaware leads in directed trust legislation, allowing different roles to be handled by trustees in different jurisdictions. The state recognizes foreign trusts and provides clear migration procedures.'
      },
      taxTreatment: {
        score: 7,
        hasStateTax: true,
        incomeRate: '0-6.6%',
        summary: 'Income tax but favorable trust rules',
        details: 'Delaware has a state income tax (up to 6.6%), but trusts with no Delaware beneficiaries and no Delaware-source income may avoid DE tax. Careful planning can minimize or eliminate state tax exposure.'
      },
      spendthriftProvisions: {
        score: 9,
        summary: 'Robust spendthrift protections',
        details: 'Delaware provides comprehensive spendthrift protection under 12 Del. C. § 3536. Creditors cannot reach a beneficiary\'s interest in a spendthrift trust. The protection extends to both income and principal interests.'
      },
      privacyProtections: {
        score: 9,
        summary: 'Strong confidentiality provisions',
        details: 'Trust documents are private in Delaware. The Court of Chancery can seal proceedings. Delaware\'s directed trust structure allows privacy about the identities of various trust participants.'
      },
      healthcareSpecific: {
        score: 8,
        summary: 'Flexible for healthcare planning',
        details: 'Delaware\'s sophisticated trust laws accommodate various healthcare planning strategies. Special needs trusts, medical expense trusts, and healthcare funding vehicles are all supported under Delaware law.'
      }
    }
  },
  {
    state: 'Alaska',
    stateCode: 'AK',
    overallScore: 8.8,
    tier: 'top',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://www.akleg.gov/basis/statutes.asp#13.36',
      'https://alaskabar.org/'
    ],
    highlights: [
      'First state to authorize DAPTs (1997)',
      'No state income tax',
      'Community property trust option',
      '1000-year trust duration'
    ],
    criteria: {
      assetProtection: {
        score: 9,
        summary: 'Pioneer in asset protection trusts',
        details: 'Alaska was the first state to enact DAPT legislation in 1997, creating the model that other states followed. The Alaska Trust Act provides comprehensive creditor protection for properly structured trusts.'
      },
      selfSettledTrusts: {
        score: 9,
        allowed: true,
        summary: 'Original DAPT jurisdiction',
        details: 'Alaska\'s pioneering 1997 legislation allows the settlor to be a discretionary beneficiary of their own trust. Requires an Alaska trustee and some Alaska situs. No minimum funding requirement.'
      },
      statuteOfLimitations: {
        score: 8,
        years: 4,
        summary: '4-year statute of limitations',
        details: 'Alaska provides a 4-year limitation for fraudulent transfer claims. The period runs from the date of transfer, not discovery. Pre-existing creditors have the later of 4 years or 1 year after discovery.'
      },
      domesticForeignRules: {
        score: 8,
        summary: 'Good multi-state flexibility',
        details: 'Alaska trusts can have co-trustees in other states for certain functions. The state recognizes out-of-state trusts and provides mechanisms for migration to Alaska jurisdiction.'
      },
      taxTreatment: {
        score: 10,
        hasStateTax: false,
        summary: 'No state income tax',
        details: 'Alaska has no state income tax, no sales tax (at state level), and no inheritance tax. Trust income is not taxed by the state. Additionally, Alaska\'s Permanent Fund Dividend can benefit Alaska residents.'
      },
      spendthriftProvisions: {
        score: 9,
        summary: 'Strong spendthrift enforcement',
        details: 'Alaska spendthrift provisions are robustly enforced. The Alaska Trust Act specifically protects beneficiary interests from creditors, including claims against the settlor when properly structured.'
      },
      privacyProtections: {
        score: 8,
        summary: 'Good privacy provisions',
        details: 'Alaska does not require public filing of trust documents. Trust administration is private. Court proceedings can be conducted with appropriate confidentiality protections.'
      },
      healthcareSpecific: {
        score: 7,
        summary: 'Supports healthcare trusts',
        details: 'Alaska recognizes special needs trusts and healthcare funding trusts. The state\'s flexible trust laws allow for various healthcare planning structures. No specific medical trust legislation.'
      }
    }
  },
  {
    state: 'Wyoming',
    stateCode: 'WY',
    overallScore: 8.7,
    tier: 'top',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://wyoleg.gov/statutes/compress/title04.pdf',
      'https://www.wyomingbar.org/'
    ],
    highlights: [
      'No state income tax',
      '1000-year trust duration',
      'Strong LLC/Trust combination strategies',
      'Low-cost trust administration'
    ],
    criteria: {
      assetProtection: {
        score: 8,
        summary: 'Growing asset protection jurisdiction',
        details: 'Wyoming has developed strong asset protection laws, particularly when combining trusts with Wyoming LLCs. The state\'s Qualified Spendthrift Trust Act provides creditor protection for self-settled trusts.'
      },
      selfSettledTrusts: {
        score: 8,
        allowed: true,
        summary: 'Qualified Spendthrift Trust Act',
        details: 'Wyoming authorized DAPTs in 2007. The settlor can be a discretionary beneficiary. Requires a Wyoming trustee. The trust can hold Wyoming LLC interests for additional protection layers.'
      },
      statuteOfLimitations: {
        score: 7,
        years: 4,
        summary: '4-year limitation with exceptions',
        details: 'Wyoming provides a 4-year statute of limitations for fraudulent transfer claims. The state also has provisions for tolling in certain circumstances. Child support and alimony are exception creditors.'
      },
      domesticForeignRules: {
        score: 8,
        summary: 'Flexible jurisdiction rules',
        details: 'Wyoming recognizes foreign trusts and provides straightforward migration procedures. The state\'s favorable LLC laws complement its trust statutes for multi-jurisdictional planning.'
      },
      taxTreatment: {
        score: 10,
        hasStateTax: false,
        summary: 'No state income tax',
        details: 'Wyoming has no state income tax, no corporate income tax, no franchise tax, and no inheritance tax. This makes Wyoming one of the most tax-friendly jurisdictions for trust administration.'
      },
      spendthriftProvisions: {
        score: 8,
        summary: 'Solid spendthrift protections',
        details: 'Wyoming\'s Uniform Trust Code adoption includes strong spendthrift provisions. Beneficiary interests in spendthrift trusts are protected from most creditors, with standard exceptions.'
      },
      privacyProtections: {
        score: 9,
        summary: 'Excellent privacy for trusts and LLCs',
        details: 'Wyoming is known for privacy. No public filing of trust documents. Wyoming LLCs (often used with trusts) have strong privacy protections. Nominee services available for additional privacy.'
      },
      healthcareSpecific: {
        score: 7,
        summary: 'Standard healthcare trust support',
        details: 'Wyoming recognizes special needs trusts and allows healthcare funding trusts. The combination of trusts with Wyoming LLCs can provide flexible healthcare asset protection planning.'
      }
    }
  },

  // FAVORABLE STATES
  {
    state: 'Tennessee',
    stateCode: 'TN',
    overallScore: 8.0,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://www.tn.gov/content/tn/sos/acts.html',
      'https://www.tba.org/'
    ],
    highlights: [
      'No state income tax on wages',
      'Tennessee Investment Services Trust Act',
      '360-year trust duration',
      'Strong spendthrift provisions'
    ],
    criteria: {
      assetProtection: {
        score: 8,
        summary: 'Tennessee Investment Services Trust Act',
        details: 'Tennessee enacted DAPT legislation in 2007 through the Tennessee Investment Services Trust Act. The state provides solid asset protection with a focus on investment management trusts.'
      },
      selfSettledTrusts: {
        score: 8,
        allowed: true,
        summary: 'DAPT authorized since 2007',
        details: 'Tennessee permits self-settled asset protection trusts. The settlor can be a beneficiary of discretionary distributions. Requires a Tennessee trustee. 4-year fraudulent transfer lookback.'
      },
      statuteOfLimitations: {
        score: 7,
        years: 4,
        summary: '4-year statute of limitations',
        details: 'Tennessee provides a 4-year limitation period for creditor challenges. The period begins from the date of transfer. Standard exceptions for fraud apply.'
      },
      domesticForeignRules: {
        score: 7,
        summary: 'Standard interstate provisions',
        details: 'Tennessee recognizes out-of-state trusts and provides for trust migration. The state follows typical conflicts of law principles for trust matters.'
      },
      taxTreatment: {
        score: 9,
        hasStateTax: false,
        summary: 'No income tax on wages/interest',
        details: 'Tennessee has no state income tax on wages or interest income (Hall Tax eliminated in 2021). This makes Tennessee attractive for trusts generating interest and dividend income.'
      },
      spendthriftProvisions: {
        score: 8,
        summary: 'Strong spendthrift clause enforcement',
        details: 'Tennessee provides comprehensive spendthrift trust protections. The state\'s UTC-based trust code includes robust provisions protecting beneficiary interests from creditors.'
      },
      privacyProtections: {
        score: 7,
        summary: 'Standard trust privacy',
        details: 'Tennessee does not require public registration of trusts. Trust documents are private unless court proceedings require disclosure. Standard confidentiality protections apply.'
      },
      healthcareSpecific: {
        score: 7,
        summary: 'Supports healthcare trusts',
        details: 'Tennessee recognizes special needs trusts and permits healthcare funding through trust structures. No specific medical trust legislation but general laws are accommodating.'
      }
    }
  },
  {
    state: 'Ohio',
    stateCode: 'OH',
    overallScore: 7.5,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://codes.ohio.gov/ohio-revised-code/chapter-5816',
      'https://www.ohiobar.org/'
    ],
    highlights: [
      'Legacy Trust Act (DAPT)',
      '18-month statute of limitations',
      'No gift tax',
      'Strong spendthrift provisions'
    ],
    criteria: {
      assetProtection: {
        score: 7,
        summary: 'Ohio Legacy Trust Act',
        details: 'Ohio\'s Legacy Trust Act (2013) provides asset protection through qualified spendthrift trusts. While not as comprehensive as top-tier states, Ohio offers solid protection for properly structured trusts.'
      },
      selfSettledTrusts: {
        score: 7,
        allowed: true,
        summary: 'Legacy Trust Act DAPTs',
        details: 'Ohio permits self-settled asset protection trusts under the Legacy Trust Act. Requires an Ohio trustee and specific statutory provisions. Minimum $1 million in qualified trust assets.'
      },
      statuteOfLimitations: {
        score: 9,
        years: 1.5,
        summary: '18-month limitation period',
        details: 'Ohio provides an 18-month statute of limitations for fraudulent transfer claims - one of the shortest in the nation. This short window provides strong protection for legitimate transfers.'
      },
      domesticForeignRules: {
        score: 7,
        summary: 'Standard recognition provisions',
        details: 'Ohio recognizes out-of-state trusts under standard conflicts principles. The state provides mechanisms for trust modification and migration under its UTC adoption.'
      },
      taxTreatment: {
        score: 6,
        hasStateTax: true,
        incomeRate: '0-3.99%',
        summary: 'Moderate state income tax',
        details: 'Ohio has a graduated state income tax up to 3.99%. Trusts are subject to Ohio income tax on income from Ohio sources or income distributed to Ohio beneficiaries.'
      },
      spendthriftProvisions: {
        score: 8,
        summary: 'Strong spendthrift protections',
        details: 'Ohio\'s trust code provides comprehensive spendthrift protections. The Legacy Trust Act enhances these protections for qualifying trusts with specific creditor shield provisions.'
      },
      privacyProtections: {
        score: 7,
        summary: 'Standard privacy provisions',
        details: 'Trust documents are not publicly filed in Ohio. Trust proceedings in probate court can be conducted with appropriate confidentiality. Standard privacy protections apply.'
      },
      healthcareSpecific: {
        score: 7,
        summary: 'Recognizes healthcare trusts',
        details: 'Ohio law accommodates special needs trusts and healthcare funding trusts. The state\'s Medicaid planning rules work with properly structured special needs trusts.'
      }
    }
  },

  // MODERATE STATES (examples)
  {
    state: 'Florida',
    stateCode: 'FL',
    overallScore: 6.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://www.flsenate.gov/Laws/Statutes/2023/Chapter736',
      'https://www.floridabar.org/'
    ],
    highlights: [
      'No state income tax',
      'UTC adoption with modifications',
      'Strong homestead protection (not trust-based)',
      'No DAPTs allowed'
    ],
    criteria: {
      assetProtection: {
        score: 6,
        summary: 'Limited trust-based protection',
        details: 'Florida does not permit DAPTs. Asset protection relies on other mechanisms (homestead, tenancy by entireties, retirement accounts). Third-party trusts provide standard creditor protection.'
      },
      selfSettledTrusts: {
        score: 2,
        allowed: false,
        summary: 'DAPTs not authorized',
        details: 'Florida does not authorize domestic asset protection trusts. Self-settled trusts are reachable by the settlor\'s creditors. Florida residents often use out-of-state DAPT jurisdictions.'
      },
      statuteOfLimitations: {
        score: 5,
        years: 4,
        summary: 'Standard 4-year fraudulent transfer period',
        details: 'Florida follows the Uniform Voidable Transactions Act with a 4-year limitation period. Without DAPT protections, this applies to self-settled trust transfers more broadly.'
      },
      domesticForeignRules: {
        score: 7,
        summary: 'Recognizes out-of-state trusts',
        details: 'Florida recognizes trusts established in other states, including DAPTs from DAPT jurisdictions. Florida residents can be beneficiaries of out-of-state asset protection trusts.'
      },
      taxTreatment: {
        score: 10,
        hasStateTax: false,
        summary: 'No state income tax',
        details: 'Florida has no state income tax, making it attractive for retirees and trust beneficiaries. Trust income is not subject to Florida state tax. No estate or inheritance tax either.'
      },
      spendthriftProvisions: {
        score: 7,
        summary: 'Standard spendthrift protections',
        details: 'Florida recognizes and enforces spendthrift provisions in third-party trusts. Beneficiary interests are protected from most creditors, with standard exceptions for support obligations.'
      },
      privacyProtections: {
        score: 6,
        summary: 'Moderate privacy protections',
        details: 'Trust documents are not publicly filed, but Florida\'s broad public records law can affect privacy in certain contexts. Trust litigation becomes part of court records.'
      },
      healthcareSpecific: {
        score: 7,
        summary: 'Good healthcare trust support',
        details: 'Florida has well-developed special needs trust law due to its large retiree population. Healthcare funding trusts are recognized. Medicaid planning trusts have specific requirements.'
      }
    }
  },
  {
    state: 'Texas',
    stateCode: 'TX',
    overallScore: 6.0,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://statutes.capitol.texas.gov/Docs/PR/htm/PR.112.htm',
      'https://www.texasbar.com/'
    ],
    highlights: [
      'No state income tax',
      'Strong homestead protections',
      'No DAPTs',
      'Community property state'
    ],
    criteria: {
      assetProtection: {
        score: 5,
        summary: 'Limited trust-based asset protection',
        details: 'Texas does not authorize DAPTs. The state relies on other asset protection mechanisms (homestead, retirement accounts, insurance, business entities). Third-party trusts offer standard protection.'
      },
      selfSettledTrusts: {
        score: 2,
        allowed: false,
        summary: 'DAPTs not permitted',
        details: 'Texas does not authorize self-settled asset protection trusts. Self-settled trust assets are generally reachable by the settlor\'s creditors. Texas residents use out-of-state DAPTs.'
      },
      statuteOfLimitations: {
        score: 5,
        years: 4,
        summary: 'Standard limitation periods',
        details: 'Texas follows standard fraudulent transfer rules with a 4-year limitation period. The state adopted the Uniform Voidable Transactions Act in 2019.'
      },
      domesticForeignRules: {
        score: 7,
        summary: 'Recognizes out-of-state trusts',
        details: 'Texas generally recognizes trusts established under other states\' laws. Texas residents can serve as beneficiaries of out-of-state asset protection trusts.'
      },
      taxTreatment: {
        score: 10,
        hasStateTax: false,
        summary: 'No state income tax',
        details: 'Texas has no state income tax on individuals or trusts. Combined with strong homestead protections, Texas is attractive for wealth preservation despite lacking DAPT legislation.'
      },
      spendthriftProvisions: {
        score: 7,
        summary: 'Standard spendthrift enforcement',
        details: 'Texas recognizes and enforces spendthrift provisions in trusts created by third parties. Standard exceptions apply for support obligations and certain other claims.'
      },
      privacyProtections: {
        score: 6,
        summary: 'Moderate privacy',
        details: 'Trust documents are not publicly registered in Texas. However, Texas has broad public records laws, and trust litigation creates public records. Standard confidentiality protections.'
      },
      healthcareSpecific: {
        score: 6,
        summary: 'Basic healthcare trust recognition',
        details: 'Texas recognizes special needs trusts and healthcare funding trusts. The state\'s Medicaid program has specific rules for trust treatment. No special medical trust legislation.'
      }
    }
  },

  // LIMITED STATES (example)
  {
    state: 'California',
    stateCode: 'CA',
    overallScore: 4.5,
    tier: 'limited',
    lastUpdated: '2024-12-01',
    sourceUrls: [
      'https://leginfo.legislature.ca.gov/faces/codes_displayexpandedbranch.xhtml?tocCode=PROB',
      'https://www.calbar.ca.gov/'
    ],
    highlights: [
      'No DAPTs allowed',
      'High state income tax',
      'Strong creditor rights',
      'Community property state'
    ],
    criteria: {
      assetProtection: {
        score: 3,
        summary: 'Limited asset protection options',
        details: 'California does not permit DAPTs and has strong creditor-friendly laws. Asset protection planning in California typically involves out-of-state trusts, retirement accounts, or business entities.'
      },
      selfSettledTrusts: {
        score: 1,
        allowed: false,
        summary: 'Self-settled trusts not protected',
        details: 'California expressly provides that a settlor\'s creditors can reach all assets of a self-settled trust, regardless of spendthrift provisions. Prob. Code § 15304.'
      },
      statuteOfLimitations: {
        score: 4,
        years: 7,
        summary: '7-year lookback possible',
        details: 'California follows the Uniform Voidable Transactions Act with potential lookback periods up to 7 years for certain fraudulent transfer claims. This is among the longest in the nation.'
      },
      domesticForeignRules: {
        score: 6,
        summary: 'May not respect out-of-state DAPTs',
        details: 'California courts may apply California law to California residents\' out-of-state DAPTs. The extent of protection is uncertain and depends on specific circumstances and connections to California.'
      },
      taxTreatment: {
        score: 2,
        hasStateTax: true,
        incomeRate: '1-13.3%',
        summary: 'Highest state income tax in nation',
        details: 'California has the highest marginal state income tax rate (13.3%). Trusts with California trustees, beneficiaries, or source income are subject to California tax. Careful planning required.'
      },
      spendthriftProvisions: {
        score: 5,
        summary: 'Limited spendthrift protection',
        details: 'California recognizes spendthrift provisions in third-party trusts but with significant exceptions. Self-settled spendthrift trusts are not protected. Public policy limitations apply.'
      },
      privacyProtections: {
        score: 5,
        summary: 'Moderate privacy with limitations',
        details: 'Trust documents are not publicly filed, but California\'s extensive disclosure requirements in various contexts can affect privacy. Court proceedings are generally public record.'
      },
      healthcareSpecific: {
        score: 6,
        summary: 'Special needs trusts recognized',
        details: 'California has developed special needs trust law, including pooled trusts and first-party special needs trusts. Medi-Cal planning involves specific trust considerations.'
      }
    }
  },

  // Additional states with placeholder/minimal data
  // These would be filled in with full research
  {
    state: 'New York',
    stateCode: 'NY',
    overallScore: 5.0,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.nysenate.gov/legislation/laws/EPT'],
    highlights: ['No DAPTs', 'High state taxes', 'Sophisticated trust law', 'Strong spendthrift provisions'],
    criteria: {
      assetProtection: { score: 4, summary: 'No DAPT legislation', details: 'New York does not authorize domestic asset protection trusts. Standard third-party trust protections apply.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not permitted', details: 'Self-settled trusts are reachable by the settlor\'s creditors in New York.' },
      statuteOfLimitations: { score: 5, years: 6, summary: '6-year limitation', details: 'New York has a 6-year statute of limitations for fraudulent conveyance claims.' },
      domesticForeignRules: { score: 7, summary: 'Recognizes out-of-state trusts', details: 'New York generally respects trusts from other jurisdictions.' },
      taxTreatment: { score: 3, hasStateTax: true, incomeRate: '4-10.9%', summary: 'High state income tax', details: 'New York has significant state and local income taxes affecting trusts.' },
      spendthriftProvisions: { score: 7, summary: 'Good spendthrift protection', details: 'New York provides solid spendthrift trust protection for third-party trusts.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed. Court proceedings may be public.' },
      healthcareSpecific: { score: 7, summary: 'Good healthcare trust support', details: 'New York has developed special needs and Medicaid planning trust law.' }
    }
  },
  {
    state: 'Missouri',
    stateCode: 'MO',
    overallScore: 7.0,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://revisor.mo.gov/main/OneSection.aspx?section=456.5-505'],
    highlights: ['DAPT legislation (2021)', '2-year statute of limitations', 'Moderate state taxes', 'Growing trust jurisdiction'],
    criteria: {
      assetProtection: { score: 7, summary: 'New DAPT jurisdiction', details: 'Missouri enacted DAPT legislation in 2021, joining the growing list of asset protection trust states.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2021', details: 'Missouri allows self-settled asset protection trusts with qualified Missouri trustees.' },
      statuteOfLimitations: { score: 9, years: 2, summary: '2-year limitation', details: 'Missouri provides a 2-year statute of limitations, among the shortest available.' },
      domesticForeignRules: { score: 7, summary: 'Standard provisions', details: 'Missouri follows typical conflicts of law principles for trusts.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '1.5-5.3%', summary: 'Moderate income tax', details: 'Missouri has a moderate state income tax affecting trust income.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift clauses', details: 'Missouri provides robust spendthrift trust protections.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private. Standard confidentiality protections.' },
      healthcareSpecific: { score: 6, summary: 'Standard healthcare support', details: 'Missouri recognizes special needs and healthcare trusts.' }
    }
  },
  {
    state: 'Virginia',
    stateCode: 'VA',
    overallScore: 6.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://law.lis.virginia.gov/vacode/title64.2/'],
    highlights: ['DAPT authorized (2012)', '5-year statute of limitations', 'Moderate state taxes', 'UTC adoption'],
    criteria: {
      assetProtection: { score: 6, summary: 'Qualified DAPT provisions', details: 'Virginia enacted qualified self-settled spendthrift trust legislation in 2012.' },
      selfSettledTrusts: { score: 6, allowed: true, summary: 'Limited DAPT authorization', details: 'Virginia allows certain self-settled trusts with specific requirements and limitations.' },
      statuteOfLimitations: { score: 6, years: 5, summary: '5-year limitation period', details: 'Virginia provides a 5-year statute of limitations for fraudulent transfer challenges.' },
      domesticForeignRules: { score: 7, summary: 'Standard recognition', details: 'Virginia recognizes out-of-state trusts under standard conflicts principles.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '2-5.75%', summary: 'Moderate state taxes', details: 'Virginia has moderate state income taxes affecting trust income.' },
      spendthriftProvisions: { score: 7, summary: 'Good spendthrift protection', details: 'Virginia provides standard spendthrift trust protections under its UTC adoption.' },
      privacyProtections: { score: 7, summary: 'Standard privacy', details: 'Trust documents are not publicly filed in Virginia.' },
      healthcareSpecific: { score: 6, summary: 'Basic healthcare trust support', details: 'Virginia recognizes special needs and healthcare funding trusts.' }
    }
  },

  // ADDITIONAL STATES - Batch 1 (A-G)
  {
    state: 'Alabama',
    stateCode: 'AL',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://alisondb.legislature.state.al.us/alison/CodeOfAlabama/1975/Coatoc.htm'],
    highlights: ['No DAPT legislation', 'UTC adoption', 'Moderate state taxes', 'Standard trust protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard trust protections', details: 'Alabama does not have DAPT legislation. Asset protection relies on standard trust mechanisms and other planning tools.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Alabama does not authorize domestic asset protection trusts. Self-settled trusts are reachable by creditors.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Alabama follows standard fraudulent transfer rules with a 4-year statute of limitations.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Alabama recognizes trusts from other jurisdictions under standard conflicts principles.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '2-5%', summary: 'Moderate income tax', details: 'Alabama has a moderate state income tax that applies to trust income.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Alabama recognizes spendthrift provisions in third-party trusts.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed in Alabama.' },
      healthcareSpecific: { score: 6, summary: 'Basic healthcare trust support', details: 'Alabama recognizes special needs trusts and healthcare funding trusts.' }
    }
  },
  {
    state: 'Arizona',
    stateCode: 'AZ',
    overallScore: 5.8,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.azleg.gov/arstitle/?title=14'],
    highlights: ['No DAPT legislation', 'UTC adoption', 'Moderate taxes', 'Growing trust jurisdiction'],
    criteria: {
      assetProtection: { score: 5, summary: 'Limited asset protection', details: 'Arizona does not have DAPT legislation. Standard trust mechanisms provide limited asset protection.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Arizona does not permit self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Arizona follows UVTA with a 4-year statute of limitations for fraudulent transfers.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Arizona recognizes out-of-state trusts under standard conflicts of law principles.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '2.5%', summary: 'Flat 2.5% tax', details: 'Arizona has a flat 2.5% income tax rate, relatively favorable compared to other states.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Arizona recognizes and enforces spendthrift provisions in trusts.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private unless court proceedings require disclosure.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Arizona recognizes special needs trusts and healthcare planning trusts.' }
    }
  },
  {
    state: 'Arkansas',
    stateCode: 'AR',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.arkleg.state.ar.us/'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'UTC-based trust code', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Arkansas does not have DAPT legislation. Standard third-party trust protections apply.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Arkansas does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 5, summary: '5-year limitation', details: 'Arkansas has a 5-year statute of limitations for fraudulent transfer claims.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Arkansas recognizes out-of-state trusts under standard principles.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '2-4.9%', summary: 'Moderate income tax', details: 'Arkansas has graduated income tax rates up to 4.9%.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Arkansas enforces spendthrift provisions in third-party trusts.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Arkansas recognizes special needs and healthcare trusts.' }
    }
  },
  {
    state: 'Colorado',
    stateCode: 'CO',
    overallScore: 6.2,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://leg.colorado.gov/colorado-revised-statutes'],
    highlights: ['No DAPT legislation', 'Strong UTC adoption', 'Moderate taxes', 'Good trust administration'],
    criteria: {
      assetProtection: { score: 5, summary: 'Limited asset protection', details: 'Colorado does not have DAPT legislation. Asset protection relies on standard trust mechanisms.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Colorado does not authorize domestic asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Colorado follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 7, summary: 'Good interstate recognition', details: 'Colorado has comprehensive UTC adoption with good interstate recognition.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '4.4%', summary: 'Flat 4.4% tax', details: 'Colorado has a flat 4.4% income tax rate.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Colorado has robust spendthrift trust provisions under its UTC adoption.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are not publicly filed. Colorado has good trust privacy protections.' },
      healthcareSpecific: { score: 7, summary: 'Good healthcare support', details: 'Colorado has well-developed special needs trust and healthcare planning options.' }
    }
  },
  {
    state: 'Connecticut',
    stateCode: 'CT',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.cga.ct.gov/current/pub/chap_802c.htm'],
    highlights: ['No DAPT legislation', 'High state taxes', 'Strong trust traditions', 'Limited protections'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Connecticut does not have DAPT legislation and has strong creditor rights.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Connecticut does not permit self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Connecticut follows standard fraudulent conveyance rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Connecticut recognizes out-of-state trusts under standard principles.' },
      taxTreatment: { score: 3, hasStateTax: true, incomeRate: '3-6.99%', summary: 'High state taxes', details: 'Connecticut has relatively high state income taxes affecting trusts.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Connecticut recognizes spendthrift provisions with standard exceptions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private unless litigation requires disclosure.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Connecticut recognizes special needs and healthcare funding trusts.' }
    }
  },
  {
    state: 'Georgia',
    stateCode: 'GA',
    overallScore: 5.8,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://law.justia.com/codes/georgia/title-53/'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'Strong trust code', 'Good spendthrift provisions'],
    criteria: {
      assetProtection: { score: 5, summary: 'Limited asset protection', details: 'Georgia does not have DAPT legislation. Standard trust protections apply.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Georgia does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Georgia follows standard fraudulent transfer rules with a 4-year limitation.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Georgia recognizes trusts from other jurisdictions.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '1-5.49%', summary: 'Moderate income tax', details: 'Georgia has graduated income tax rates up to 5.49%.' },
      spendthriftProvisions: { score: 7, summary: 'Good spendthrift protection', details: 'Georgia has solid spendthrift trust provisions protecting beneficiary interests.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed in Georgia.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Georgia recognizes special needs trusts and healthcare planning vehicles.' }
    }
  },
  {
    state: 'Hawaii',
    stateCode: 'HI',
    overallScore: 7.2,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0554G/'],
    highlights: ['DAPT legislation (2010)', '2-year statute of limitations', 'Moderate state taxes', 'Permitted Transfers in Trust Act'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Hawaii enacted DAPT legislation in 2010 under the Permitted Transfers in Trust Act.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2010', details: 'Hawaii allows self-settled asset protection trusts with qualified Hawaii trustees.' },
      statuteOfLimitations: { score: 9, years: 2, summary: '2-year limitation', details: 'Hawaii has a favorable 2-year statute of limitations for creditor challenges.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Hawaii recognizes out-of-state trusts and provides migration procedures.' },
      taxTreatment: { score: 4, hasStateTax: true, incomeRate: '1.4-11%', summary: 'High state taxes', details: 'Hawaii has high state income tax rates up to 11%.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Hawaii provides robust spendthrift provisions under its DAPT legislation.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private. Hawaii provides confidentiality protections.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Hawaii recognizes special needs and healthcare funding trusts.' }
    }
  },
  {
    state: 'Idaho',
    stateCode: 'ID',
    overallScore: 5.8,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://legislature.idaho.gov/statutesrules/idstat/Title15/'],
    highlights: ['No DAPT legislation', 'Low state taxes', 'UTC adoption', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Limited protection', details: 'Idaho does not have DAPT legislation. Standard trust protections apply.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Idaho does not authorize domestic asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 5, summary: '5-year limitation', details: 'Idaho follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Idaho recognizes out-of-state trusts under standard conflicts principles.' },
      taxTreatment: { score: 7, hasStateTax: true, incomeRate: '5.8%', summary: 'Flat 5.8% rate', details: 'Idaho has a relatively straightforward flat 5.8% income tax.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Idaho enforces spendthrift provisions in trusts.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Idaho recognizes special needs and healthcare trusts.' }
    }
  },
  {
    state: 'Illinois',
    stateCode: 'IL',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.ilga.gov/legislation/ilcs/ilcs.asp?ActID=2104'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'Strong trust traditions', 'Limited protections'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Illinois does not have DAPT legislation and has strong creditor protections.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Illinois does not permit self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Illinois follows UVTA with standard limitation periods.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Illinois recognizes out-of-state trusts but may apply Illinois law to Illinois residents.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '4.95%', summary: 'Flat 4.95% rate', details: 'Illinois has a flat 4.95% income tax rate.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Illinois recognizes spendthrift provisions with standard exceptions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private unless litigation requires disclosure.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Illinois has developed special needs trust law.' }
    }
  },
  {
    state: 'Indiana',
    stateCode: 'IN',
    overallScore: 6.8,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://iga.in.gov/laws/2024/ic/titles/030'],
    highlights: ['DAPT legislation (2019)', 'Low flat tax', 'UTC adoption', 'Growing trust jurisdiction'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Indiana enacted DAPT legislation in 2019, joining the growing list of asset protection states.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2019', details: 'Indiana allows self-settled asset protection trusts with qualified Indiana trustees.' },
      statuteOfLimitations: { score: 6, years: 4, summary: '4-year limitation', details: 'Indiana provides a 4-year statute of limitations for fraudulent transfer challenges.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Indiana has comprehensive UTC adoption with good interstate recognition.' },
      taxTreatment: { score: 7, hasStateTax: true, incomeRate: '3.05%', summary: 'Low flat tax', details: 'Indiana has a low flat 3.05% state income tax rate.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Indiana provides solid spendthrift provisions under its trust code.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are not publicly filed. Good privacy protections.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Indiana recognizes special needs and healthcare funding trusts.' }
    }
  },

  // ADDITIONAL STATES - Batch 2 (I-M)
  {
    state: 'Iowa',
    stateCode: 'IA',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.legis.iowa.gov/law/iowaCode'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'Standard trust provisions', 'Agricultural trust options'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Iowa does not have DAPT legislation. Standard trust protections apply.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Iowa does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Iowa follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Iowa recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '4.4-6%', summary: 'Moderate income tax', details: 'Iowa has graduated income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Iowa recognizes spendthrift provisions in trusts.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Iowa recognizes special needs and healthcare trusts.' }
    }
  },
  {
    state: 'Kansas',
    stateCode: 'KS',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.ksrevisor.org/statutes/chapters/ch58a/'],
    highlights: ['No DAPT legislation', 'Moderate taxes', 'UTC adoption', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Kansas does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Kansas does not permit self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Kansas follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Kansas recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '3.1-5.7%', summary: 'Moderate income tax', details: 'Kansas has moderate state income taxes.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Kansas enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Kansas recognizes healthcare trusts.' }
    }
  },
  {
    state: 'Kentucky',
    stateCode: 'KY',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://apps.legislature.ky.gov/law/statutes/'],
    highlights: ['No DAPT legislation', 'Flat income tax', 'Standard trust provisions', 'Limited protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Kentucky does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Kentucky does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 5, summary: '5-year limitation', details: 'Kentucky has a 5-year statute of limitations.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Kentucky recognizes out-of-state trusts.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '4.5%', summary: 'Flat 4.5% tax', details: 'Kentucky has a flat 4.5% income tax rate.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Kentucky recognizes spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Kentucky recognizes healthcare trusts.' }
    }
  },
  {
    state: 'Louisiana',
    stateCode: 'LA',
    overallScore: 5.0,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://legis.la.gov/legis/Laws_Toc.aspx?folder=67'],
    highlights: ['Civil law jurisdiction', 'Unique trust rules', 'No DAPT', 'Different legal framework'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Louisiana operates under civil law with different trust concepts. No DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Louisiana does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 5, summary: '5-year limitation', details: 'Louisiana has different civil law concepts for fraudulent transfers.' },
      domesticForeignRules: { score: 5, summary: 'Unique civil law system', details: 'Louisiana has unique recognition rules due to its civil law system.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '1.85-4.25%', summary: 'Moderate income tax', details: 'Louisiana has graduated income tax rates.' },
      spendthriftProvisions: { score: 5, summary: 'Different framework', details: 'Louisiana has different civil law concepts for trust protections.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 5, summary: 'Healthcare trust support', details: 'Louisiana recognizes healthcare planning trusts.' }
    }
  },
  {
    state: 'Maine',
    stateCode: 'ME',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://legislature.maine.gov/statutes/18-B/'],
    highlights: ['No DAPT legislation', 'UTC adoption', 'Moderate state taxes', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Maine does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Maine does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 6, summary: '6-year limitation', details: 'Maine has a 6-year statute of limitations for fraudulent transfers.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Maine recognizes out-of-state trusts under UTC.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '5.8-7.15%', summary: 'Moderate-high taxes', details: 'Maine has moderate to high state income taxes.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Maine enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Maine has developed healthcare planning options.' }
    }
  },
  {
    state: 'Maryland',
    stateCode: 'MD',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=get'],
    highlights: ['No DAPT legislation', 'Higher state taxes', 'Strong trust traditions', 'DC proximity'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Maryland does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Maryland does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 3, summary: '3-year limitation', details: 'Maryland has a 3-year statute of limitations for some claims.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Maryland recognizes out-of-state trusts.' },
      taxTreatment: { score: 4, hasStateTax: true, incomeRate: '2-5.75%', summary: 'Higher state taxes', details: 'Maryland has state and local income taxes affecting trusts.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Maryland recognizes spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Maryland recognizes healthcare planning trusts.' }
    }
  },
  {
    state: 'Massachusetts',
    stateCode: 'MA',
    overallScore: 5.2,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://malegislature.gov/Laws/GeneralLaws/PartII/TitleII/Chapter203E'],
    highlights: ['No DAPT legislation', 'UTC adoption', 'Moderate-high taxes', 'Strong trust traditions'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Massachusetts does not have DAPT legislation and has strong creditor rights.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Massachusetts does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Massachusetts follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Massachusetts recognizes out-of-state trusts.' },
      taxTreatment: { score: 4, hasStateTax: true, incomeRate: '5%', summary: 'Flat 5% rate', details: 'Massachusetts has a flat 5% income tax affecting trusts.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Massachusetts enforces spendthrift provisions with standard exceptions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are not publicly filed.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Massachusetts has developed healthcare planning trust options.' }
    }
  },
  {
    state: 'Michigan',
    stateCode: 'MI',
    overallScore: 7.0,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.legislature.mi.gov/'],
    highlights: ['DAPT legislation (2016)', 'Qualified Dispositions in Trust Act', 'Moderate taxes', 'Growing trust jurisdiction'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Michigan enacted DAPT legislation in 2016 under the Qualified Dispositions in Trust Act.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2016', details: 'Michigan allows qualified self-settled spendthrift trusts with Michigan trustees.' },
      statuteOfLimitations: { score: 7, years: 4, summary: '4-year limitation', details: 'Michigan provides a 4-year statute of limitations for creditor challenges.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Michigan has comprehensive trust code with good interstate recognition.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '4.05%', summary: 'Flat 4.05% rate', details: 'Michigan has a relatively low flat 4.05% income tax rate.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Michigan provides robust spendthrift provisions under DAPT legislation.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private with good confidentiality protections.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Michigan recognizes special needs and healthcare funding trusts.' }
    }
  },
  {
    state: 'Minnesota',
    stateCode: 'MN',
    overallScore: 5.2,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.revisor.mn.gov/statutes/cite/501C'],
    highlights: ['No DAPT legislation', 'Higher state taxes', 'UTC adoption', 'Strong trust traditions'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Minnesota does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Minnesota does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 6, summary: '6-year limitation', details: 'Minnesota has a 6-year statute of limitations.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Minnesota recognizes out-of-state trusts under UTC.' },
      taxTreatment: { score: 3, hasStateTax: true, incomeRate: '5.35-9.85%', summary: 'High state taxes', details: 'Minnesota has high state income tax rates up to 9.85%.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Minnesota enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Minnesota has developed healthcare planning options.' }
    }
  },
  {
    state: 'Mississippi',
    stateCode: 'MS',
    overallScore: 7.2,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://law.justia.com/codes/mississippi/title-91/'],
    highlights: ['DAPT legislation (2014)', 'Qualified Disposition in Trust Act', 'Low state taxes', '2-year limitation'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Mississippi enacted DAPT legislation in 2014.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2014', details: 'Mississippi allows qualified self-settled spendthrift trusts.' },
      statuteOfLimitations: { score: 9, years: 2, summary: '2-year limitation', details: 'Mississippi has a favorable 2-year statute of limitations.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Mississippi recognizes out-of-state trusts and provides migration procedures.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '4-5%', summary: 'Low state taxes', details: 'Mississippi has relatively low state income taxes.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Mississippi provides robust spendthrift provisions.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Mississippi recognizes healthcare planning trusts.' }
    }
  },
  {
    state: 'Montana',
    stateCode: 'MT',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://leg.mt.gov/bills/mca/title_0720/chapters_index.html'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'UTC-based code', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Montana does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Montana does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 5, summary: '5-year limitation', details: 'Montana follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Montana recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '1-6.75%', summary: 'Moderate income tax', details: 'Montana has graduated income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Montana enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Montana recognizes healthcare trusts.' }
    }
  },

  // ADDITIONAL STATES - Batch 3 (N-P)
  {
    state: 'Nebraska',
    stateCode: 'NE',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://nebraskalegislature.gov/laws/browse-chapters.php?chapter=30'],
    highlights: ['No DAPT legislation', 'UTC adoption', 'Moderate state taxes', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Nebraska does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Nebraska does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Nebraska follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Nebraska recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '2.46-6.84%', summary: 'Moderate income tax', details: 'Nebraska has graduated income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Nebraska enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Nebraska recognizes healthcare trusts.' }
    }
  },
  {
    state: 'New Hampshire',
    stateCode: 'NH',
    overallScore: 7.8,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.gencourt.state.nh.us/rsa/html/LXIV/564-D/564-D-mrg.htm'],
    highlights: ['DAPT legislation (2008)', 'No state income tax on wages', 'Strong asset protection', '4-year limitation'],
    criteria: {
      assetProtection: { score: 8, summary: 'Strong DAPT jurisdiction', details: 'New Hampshire enacted DAPT legislation in 2008 with comprehensive asset protection.' },
      selfSettledTrusts: { score: 8, allowed: true, summary: 'Full DAPT authorization', details: 'New Hampshire permits self-settled asset protection trusts with NH trustees.' },
      statuteOfLimitations: { score: 7, years: 4, summary: '4-year limitation', details: 'New Hampshire has a 4-year statute of limitations for creditor challenges.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'New Hampshire recognizes out-of-state trusts and provides migration procedures.' },
      taxTreatment: { score: 8, hasStateTax: false, summary: 'No wage income tax', details: 'New Hampshire has no state income tax on wages/earned income. Only interest and dividends.' },
      spendthriftProvisions: { score: 8, summary: 'Strong spendthrift protection', details: 'New Hampshire provides robust spendthrift provisions under DAPT legislation.' },
      privacyProtections: { score: 8, summary: 'Strong privacy', details: 'Trust documents are private with strong confidentiality protections.' },
      healthcareSpecific: { score: 7, summary: 'Good healthcare support', details: 'New Hampshire supports healthcare planning trusts.' }
    }
  },
  {
    state: 'New Jersey',
    stateCode: 'NJ',
    overallScore: 5.0,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.njleg.state.nj.us/'],
    highlights: ['No DAPT legislation', 'High state taxes', 'Strong creditor rights', 'Limited protections'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'New Jersey does not have DAPT legislation and has strong creditor rights.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'New Jersey does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'New Jersey follows UVTA with standard limitations.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'New Jersey recognizes out-of-state trusts.' },
      taxTreatment: { score: 3, hasStateTax: true, incomeRate: '1.4-10.75%', summary: 'High state taxes', details: 'New Jersey has high state income taxes up to 10.75%.' },
      spendthriftProvisions: { score: 5, summary: 'Standard spendthrift protection', details: 'New Jersey recognizes spendthrift provisions with exceptions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'New Jersey has developed healthcare planning options.' }
    }
  },
  {
    state: 'New Mexico',
    stateCode: 'NM',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://nmonesource.com/nmos/nmsa/en/nav.do'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'Community property state', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'New Mexico does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'New Mexico does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'New Mexico follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'New Mexico recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '1.7-5.9%', summary: 'Moderate income tax', details: 'New Mexico has graduated income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'New Mexico enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'New Mexico recognizes healthcare trusts.' }
    }
  },
  {
    state: 'North Carolina',
    stateCode: 'NC',
    overallScore: 5.8,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.ncleg.gov/Laws/GeneralStatutes/Chapter36C'],
    highlights: ['No DAPT legislation', 'Flat income tax', 'UTC adoption', 'Good trust administration'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'North Carolina does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'North Carolina does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'North Carolina follows UVTA.' },
      domesticForeignRules: { score: 6, summary: 'Good recognition', details: 'North Carolina has comprehensive UTC adoption.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '5.25%', summary: 'Flat 5.25% rate', details: 'North Carolina has a flat 5.25% income tax.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'North Carolina enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'North Carolina supports healthcare planning trusts.' }
    }
  },
  {
    state: 'North Dakota',
    stateCode: 'ND',
    overallScore: 5.8,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.ndlegis.gov/cencode/T59.html'],
    highlights: ['No DAPT legislation', 'Low state taxes', 'UTC adoption', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'North Dakota does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'North Dakota does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'North Dakota follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'North Dakota recognizes out-of-state trusts.' },
      taxTreatment: { score: 7, hasStateTax: true, incomeRate: '1.1-2.9%', summary: 'Low state taxes', details: 'North Dakota has low state income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'North Dakota enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'North Dakota recognizes healthcare trusts.' }
    }
  },
  {
    state: 'Oklahoma',
    stateCode: 'OK',
    overallScore: 7.0,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.oscn.net/applications/oscn/index.asp?ftdb=STOKST&level=1'],
    highlights: ['DAPT legislation (2004)', 'Family Wealth Preservation Trust Act', 'Moderate taxes', '4-year limitation'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Oklahoma enacted DAPT legislation in 2004 under the Family Wealth Preservation Trust Act.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2004', details: 'Oklahoma allows self-settled asset protection trusts with Oklahoma trustees.' },
      statuteOfLimitations: { score: 7, years: 4, summary: '4-year limitation', details: 'Oklahoma has a 4-year statute of limitations for creditor challenges.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Oklahoma recognizes out-of-state trusts and provides migration procedures.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '0.25-4.75%', summary: 'Moderate income tax', details: 'Oklahoma has graduated income tax rates up to 4.75%.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Oklahoma provides robust spendthrift provisions under DAPT legislation.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Oklahoma recognizes healthcare planning trusts.' }
    }
  },
  {
    state: 'Oregon',
    stateCode: 'OR',
    overallScore: 5.2,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.oregonlegislature.gov/bills_laws/ors/ors130.html'],
    highlights: ['No DAPT legislation', 'Higher state taxes', 'No sales tax', 'Standard protections'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Oregon does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Oregon does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Oregon follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Oregon recognizes out-of-state trusts.' },
      taxTreatment: { score: 4, hasStateTax: true, incomeRate: '4.75-9.9%', summary: 'Higher state taxes', details: 'Oregon has high state income tax rates up to 9.9%.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Oregon enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Oregon has developed healthcare planning options.' }
    }
  },
  {
    state: 'Pennsylvania',
    stateCode: 'PA',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.legis.state.pa.us/cfdocs/legis/LI/consCheck.cfm?txtType=HTM&ttl=20'],
    highlights: ['No DAPT legislation', 'Flat income tax', 'Strong trust traditions', 'UTC-influenced code'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Pennsylvania does not have DAPT legislation but has strong trust traditions.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Pennsylvania does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Pennsylvania follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Pennsylvania recognizes out-of-state trusts.' },
      taxTreatment: { score: 7, hasStateTax: true, incomeRate: '3.07%', summary: 'Low flat rate', details: 'Pennsylvania has a low flat 3.07% income tax rate.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Pennsylvania enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Pennsylvania supports healthcare planning trusts.' }
    }
  },

  // ADDITIONAL STATES - Batch 4 (R-W)
  {
    state: 'Rhode Island',
    stateCode: 'RI',
    overallScore: 7.0,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://webserver.rilin.state.ri.us/Statutes/TITLE18/INDEX.htm'],
    highlights: ['DAPT legislation (1999)', 'Early DAPT adopter', 'Moderate state taxes', '4-year limitation'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Rhode Island was an early adopter of DAPT legislation in 1999.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 1999', details: 'Rhode Island allows self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 7, years: 4, summary: '4-year limitation', details: 'Rhode Island has a 4-year statute of limitations.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Rhode Island recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '3.75-5.99%', summary: 'Moderate income tax', details: 'Rhode Island has graduated income tax rates.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Rhode Island provides robust spendthrift provisions.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Rhode Island supports healthcare planning trusts.' }
    }
  },
  {
    state: 'South Carolina',
    stateCode: 'SC',
    overallScore: 5.8,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.scstatehouse.gov/code/statmast.php'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'UTC adoption', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'South Carolina does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'South Carolina does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'South Carolina follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'South Carolina recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '0-6.5%', summary: 'Moderate income tax', details: 'South Carolina has graduated income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'South Carolina enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'South Carolina supports healthcare planning trusts.' }
    }
  },
  {
    state: 'Utah',
    stateCode: 'UT',
    overallScore: 7.2,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://le.utah.gov/xcode/Title75/Chapter7/75-7.html'],
    highlights: ['DAPT legislation (2003)', 'Low flat tax', 'Strong asset protection', '2-year limitation'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'Utah enacted DAPT legislation in 2003 with strong asset protection.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2003', details: 'Utah allows self-settled asset protection trusts with Utah trustees.' },
      statuteOfLimitations: { score: 9, years: 2, summary: '2-year limitation', details: 'Utah has a favorable 2-year statute of limitations.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'Utah recognizes out-of-state trusts and provides migration procedures.' },
      taxTreatment: { score: 6, hasStateTax: true, incomeRate: '4.65%', summary: 'Low flat rate', details: 'Utah has a flat 4.65% income tax rate.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'Utah provides robust spendthrift provisions.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 7, summary: 'Good healthcare support', details: 'Utah supports healthcare planning trusts.' }
    }
  },
  {
    state: 'Vermont',
    stateCode: 'VT',
    overallScore: 5.2,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://legislature.vermont.gov/statutes/title/14A'],
    highlights: ['No DAPT legislation', 'Higher state taxes', 'UTC adoption', 'Limited protections'],
    criteria: {
      assetProtection: { score: 4, summary: 'Limited protection', details: 'Vermont does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Vermont does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Vermont follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Vermont recognizes out-of-state trusts under UTC.' },
      taxTreatment: { score: 4, hasStateTax: true, incomeRate: '3.35-8.75%', summary: 'Higher state taxes', details: 'Vermont has high state income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Vermont enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 5, summary: 'Basic healthcare support', details: 'Vermont recognizes healthcare trusts.' }
    }
  },
  {
    state: 'Washington',
    stateCode: 'WA',
    overallScore: 6.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://app.leg.wa.gov/RCW/default.aspx?cite=11.118'],
    highlights: ['No DAPT legislation', 'No state income tax', 'Community property state', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Limited protection', details: 'Washington does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Washington does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Washington follows UVTA.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Washington recognizes out-of-state trusts.' },
      taxTreatment: { score: 10, hasStateTax: false, summary: 'No state income tax', details: 'Washington has no state income tax.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Washington enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Washington supports healthcare planning trusts.' }
    }
  },
  {
    state: 'West Virginia',
    stateCode: 'WV',
    overallScore: 7.0,
    tier: 'favorable',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://www.wvlegislature.gov/wvcode/code.cfm?chap=44d'],
    highlights: ['DAPT legislation (2016)', 'West Virginia Asset Protection Act', 'Moderate taxes', '2-year limitation'],
    criteria: {
      assetProtection: { score: 7, summary: 'DAPT authorized', details: 'West Virginia enacted DAPT legislation in 2016 under the Asset Protection Act.' },
      selfSettledTrusts: { score: 7, allowed: true, summary: 'Permitted since 2016', details: 'West Virginia allows self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 9, years: 2, summary: '2-year limitation', details: 'West Virginia has a favorable 2-year statute of limitations.' },
      domesticForeignRules: { score: 7, summary: 'Good recognition', details: 'West Virginia recognizes out-of-state trusts.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '3-6.5%', summary: 'Moderate income tax', details: 'West Virginia has graduated income tax rates.' },
      spendthriftProvisions: { score: 7, summary: 'Strong spendthrift protection', details: 'West Virginia provides robust spendthrift provisions.' },
      privacyProtections: { score: 7, summary: 'Good privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'West Virginia supports healthcare planning trusts.' }
    }
  },
  {
    state: 'Wisconsin',
    stateCode: 'WI',
    overallScore: 5.5,
    tier: 'moderate',
    lastUpdated: '2024-12-01',
    sourceUrls: ['https://docs.legis.wisconsin.gov/statutes/statutes/701'],
    highlights: ['No DAPT legislation', 'Moderate state taxes', 'UTC adoption', 'Standard protections'],
    criteria: {
      assetProtection: { score: 5, summary: 'Standard protections', details: 'Wisconsin does not have DAPT legislation.' },
      selfSettledTrusts: { score: 2, allowed: false, summary: 'Not authorized', details: 'Wisconsin does not authorize self-settled asset protection trusts.' },
      statuteOfLimitations: { score: 5, years: 4, summary: '4-year limitation', details: 'Wisconsin follows standard fraudulent transfer rules.' },
      domesticForeignRules: { score: 6, summary: 'Standard recognition', details: 'Wisconsin recognizes out-of-state trusts under UTC.' },
      taxTreatment: { score: 5, hasStateTax: true, incomeRate: '3.54-7.65%', summary: 'Moderate income tax', details: 'Wisconsin has graduated income tax rates.' },
      spendthriftProvisions: { score: 6, summary: 'Standard spendthrift protection', details: 'Wisconsin enforces spendthrift provisions.' },
      privacyProtections: { score: 6, summary: 'Standard privacy', details: 'Trust documents are private.' },
      healthcareSpecific: { score: 6, summary: 'Healthcare trust support', details: 'Wisconsin supports healthcare planning trusts.' }
    }
  }
];

// Helper function to get state data by code
export const getStateByCode = (code: string): StateTrustLaw | undefined => {
  return stateTrustLaws.find(s => s.stateCode === code);
};

// Get all states sorted by score
export const getStatesByScore = (descending = true): StateTrustLaw[] => {
  return [...stateTrustLaws].sort((a, b) => 
    descending ? b.overallScore - a.overallScore : a.overallScore - b.overallScore
  );
};

// Get states by tier
export const getStatesByTier = (tier: StateTrustLaw['tier']): StateTrustLaw[] => {
  return stateTrustLaws.filter(s => s.tier === tier);
};

// Calculate filtered score based on selected criteria
export const calculateFilteredScore = (
  state: StateTrustLaw, 
  selectedCriteria: (keyof StateTrustLaw['criteria'])[]
): number => {
  if (selectedCriteria.length === 0) return state.overallScore;
  
  const scores = selectedCriteria.map(criterion => state.criteria[criterion].score);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

