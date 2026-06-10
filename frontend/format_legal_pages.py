from pathlib import Path

# Map exact text to professional HTML sections while preserving every word
pages = {
    'refunds.html': '''<div class="legal-body">
  <div class="legal-panel">
    <div class="legal-content">
      <h2 class="legal-section-title">Refund and Cancellation Policy</h2>
      <p class="legal-intro">At TRENDIFY TECHNOLOGIES , we are committed to providing high-quality products and services to our customers. Please note the following policy regarding refunds and cancellations:</p>
      
      <div class="legal-subsection">
        <h3 class="legal-subsection-title">Refund Policy</h3>
        <ul class="legal-list">
          <li><strong>No Refunds:</strong> Once a purchase is made, it is considered final. We do not offer refunds for any product or service under any circumstances.</li>
          <li>This policy applies to all transactions completed on our platform.</li>
        </ul>
      </div>
      
      <div class="legal-subsection">
        <h3 class="legal-subsection-title">Cancellation Policy</h3>
        <ul class="legal-list">
          <li><strong>No Cancellations:</strong> Orders or subscriptions cannot be canceled once they have been processed or confirmed.</li>
          <li>We encourage you to review your purchase carefully before completing the transaction.</li>
        </ul>
      </div>
      
      <div class="legal-subsection">
        <h3 class="legal-subsection-title">Why No Refunds or Cancellations?</h3>
        <p>Our products and services are digital in nature, and access is granted immediately upon purchase. This ensures the delivery of value but makes it impossible to reverse the transaction.</p>
        <p>This policy helps us maintain fairness and consistency across all customer interactions</p>
      </div>
    </div>
  </div>
</div>
''',
    'terms.html': '''<div class="legal-body">
  <div class="legal-panel">
    <div class="legal-content">
      <h2 class="legal-section-title">Terms and Conditions</h2>
      
      <div class="legal-clause">
        <span class="legal-clause-num">1.</span>
        <div class="legal-clause-content">
          <h3>Introduction</h3>
          <p>These Terms and Conditions ("T&C") govern the use of services provided by Trendify Technologies (hereinafter referred to as "the Company", "We", "Us", or "Our"), with its registered office at Koliatha,Basudevpur,Mahanga,Cuttack. The T&C apply to (i) "You", "Your", "Yourself", or "User"; and (ii) "End-User" (collectively referred to as "they", "them", or "their") who access or avail the Services offered through Our "Website", "Trendify", or "Platform" (collectively referring to the websitehttps://trendifytechnologies.com, its linked pages, or application services, including mobile applications or mobile site services).</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">2.</span>
        <div class="legal-clause-content">
          <p>This document is an electronic record under the Indian Contract Act, 1872, and the Information Technology Act, 2000, along with applicable rules and regulations (including amendments or re-enactments thereof), and does not require physical, electronic, or digital signatures.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">3.</span>
        <div class="legal-clause-content">
          <p>Please carefully review these T&Cs before using Trendify's services or accessing any material or information on the Platform. By accessing or using the Platform, Users and End-Users signify that they have read, understood, and agree to be legally bound by these T&Cs, including additional terms, conditions, and policies referenced herein or available via hyperlink on the Website.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">4.</span>
        <div class="legal-clause-content">
          <p>Your use of the Services (as defined below) constitutes acceptance of these T&Cs from the point of usage. Trendify reserves the right to update or modify the Services periodically without prior notice. If You do not accept these T&Cs, You may not use the Services. Users and End-Users are advised to periodically review the most current version of these T&Cs on the Website. Continued use of the Platform after any updates signifies acceptance of the modified terms.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">5.</span>
        <div class="legal-clause-content">
          <p>If You object to these T&Cs or any subsequent modifications, Your sole recourse is to cease using the Platform immediately. Additional terms may apply for specific services availed from time to time.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">6.</span>
        <div class="legal-clause-content">
          <p>By providing Your contact details, You consent to be contacted by Us or Our representatives via any provided contact number, email, or address.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">7.</span>
        <div class="legal-clause-content">
          <p>By submitting Personal Information to the Company or consenting to its use for rendering Services, You express interest in availing Trendify's Services in accordance with these T&Cs. Trendify is not an educational institution, marketplace, or content provider, and Users are neither Our employees nor agents.</p>
          <h4>Definitions</h4>
          <p>Capitalized terms used in these T&Cs shall have the meanings assigned below or as specified elsewhere in these T&Cs. Terms not defined herein shall have meanings as commonly understood under Applicable Law.</p>
          <ul class="legal-definitions">
            <li><strong>Applicable Law:</strong> Any statute, law, regulation, ordinance, rule, judgment, order, decree, approval, directive, guideline, policy, requirement, restriction, decision, determination, or interpretation by any applicable Authority, as amended.</li>
            <li><strong>Authority:</strong> Includes the Government of India, state governments, or any administrative, regulatory, statutory, tax-related, judicial, or quasi-judicial authority in India, including ministries, courts, tribunals, departments, boards, officers, or foreign governmental, statutory, or regulatory authorities, where applicable.</li>
            <li><strong>Confidential Information:</strong> All information disclosed or acquired during the subscription term, including User and End-User lists, names, addresses, business models, processes, concepts, product descriptions, specifications, fees, and prices. Exclusions include information: (i) already known without a non-disclosure agreement; (ii) received from a third party not bound by confidentiality; (iii) publicly known; (iv) independently developed; (v) authorized for publication; or (vi) required to be disclosed by court or governmental order, provided the affected party is notified promptly.</li>
            <li><strong>Content:</strong> Software, data, text, audio, video, images, coaching offerings, or personal data uploaded, collected, posted, stored, displayed, distributed, or transmitted in connection with Your Account on the Platform.</li>
            <li><strong>End-User:</strong> Any person accessing Content on a User's Landing Page via any device.</li>
            <li><strong>Landing Page:</strong> A unique webpage created through Trendify's software, dedicated to You, where Your services, courses, programs, and Content are curated for End-Users.</li>
            <li><strong>Party/Parties:</strong> Trendify , Users, and End-Users.</li>
            <li><strong>Person:</strong> Any natural person, company, partnership, proprietorship, trust, union, association, society, cooperative, government, or entity treated as a person under Applicable Law.</li>
            <li><strong>Platform Fee:</strong> Fees, maintenance charges, or convenience fees payable by You for using Our Platform to host Your Content for sale to End-Users.</li>
            <li><strong>Service Fee:</strong> Fees payable by You for availing Our Services through subscription models, as described on the Website and billed per Company policy.</li>
            <li><strong>Services:</strong> All services, functionalities, and tools offered by Trendify through the Platform, as outlined in clause 3 below.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">8.</span>
        <div class="legal-clause-content">
          <h4>Eligibility</h4>
          <ul class="legal-list">
            <li>If You are an individual, You must be at least 18 years old. If representing an organization (e.g., company, partnership, or proprietorship) duly organized under Applicable Law, You must be authorized to act on its behalf and meet additional eligibility requirements set by the Company.</li>
            <li>You represent and warrant that You are competent to enter into a legally binding agreement under Applicable Law. If acting for an organization, You confirm Your authority to bind it to these T&Cs. If accessing Services for a minor, You confirm Your legal competence to provide consent on their behalf.</li>
            <li>Persons incompetent to contract under the Indian Contract Act, 1872 (e.g., un-discharged insolvents) are not eligible to use the Platform.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">9.</span>
        <div class="legal-clause-content">
          <h4>Services and User Guidelines</h4>
          <p>Trendify provides Services to enable Users to:</p>
          <ul class="legal-list">
            <li>Create, design, upload, publish, and sell Content through their Landing Page or third-party applications.</li>
            <li>Build and manage a Landing Page subject to these T&Cs and Company policies.</li>
            <li>Use ancillary tools for managing Content, including messaging and discussion forums with End-Users, which may be enabled or disabled via Your dashboard.</li>
            <li>Integrate with third-party applications (e.g., Telegram, WhatsApp) to upload, publish, and manage Content.</li>
          </ul>
          <p>Trendify offers a Software-as-a-Service (SaaS) solution to create, share, and distribute Content and generate links/sub-domains to third-party platforms. Services are provided "as is" and "as available," with reasonable efforts to ensure 24/7 availability. Trendify is not responsible for downtime caused by:</p>
          <ul class="legal-list">
            <li>Force majeure events.</li>
            <li>Third-party issues (e.g., payment gateways, hosting providers).</li>
            <li>User actions or inactions.</li>
            <li>Planned maintenance.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">10.</span>
        <div class="legal-clause-content">
          <h4>Creation of Account</h4>
          <ul class="legal-list">
            <li>You may browse certain Platform sections without an Account but must create one to access Services, providing information as required under the Privacy Policy.</li>
            <li>Registration is free, and only eligible persons (per clause 2) may register, with one Account per person.</li>
            <li>You must choose a unique, non-infringing username and URL that is not immoral, deceptive, or obscene.</li>
            <li>You are responsible for maintaining accurate, current, and complete Account information and safeguarding login credentials. Notify Trendify immediately of unauthorized Account use or security breaches.</li>
            <li>You are solely responsible for Your Landing Page's operation, Content, pricing, and interactions with End-Users. Trendify is not liable for disputes, claims, or damages arising from Your Landing Page or business dealings.</li>
            <li>Services are provided on a non-exclusive, non-transferable, non-sublicensable, limited license basis for personal use. Trendify may provide Services to competitors and is not liable for Content managed via third-party applications.</li>
            <li>Trendify reserves the right to refuse Service, suspend, or terminate Accounts for violations of Applicable Law, these T&Cs, or third-party rights, without prior notice.</li>
            <li>You are responsible for ensuring adequate technical requirements (e.g., bandwidth, latency). You must not engage in activities that violate Applicable Law, infringe rights, or are threatening, abusive, or deceptive.</li>
            <li>Trendify may disclose Account information to authorities as required by Applicable Law.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">11.</span>
        <div class="legal-clause-content">
          <h4>Fees and Payment Terms</h4>
          <ul class="legal-list">
            <li>Service Fees and Platform Fees are determined by Company policy and may be billed periodically.</li>
            <li>Fees are governed by Trendify's Refund & Cancellation Policy, available on the Website.</li>
            <li>Trendify collects fees from End-Users only on Your behalf for Your Content.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">12.</span>
        <div class="legal-clause-content">
          <h4>Warranties</h4>
          <p>You represent and warrant that:</p>
          <ul class="legal-list">
            <li>You own or have necessary licenses for Your Content and its publication.</li>
            <li>You will not misrepresent Yourself as regulated by sectoral authorities (e.g., SEBI, RBI) unless duly registered.</li>
            <li>Your Content does not infringe intellectual property or other rights, contain harmful or hateful material, or violate Applicable Law.</li>
            <li>You grant Trendify a limited license to make Your Content available on the Platform.</li>
            <li>You are solely responsible for claims related to Your Content.</li>
            <li>Trendify makes no warranty that Services will meet Your requirements or be uninterrupted, secure, or error-free.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">13.</span>
        <div class="legal-clause-content"></div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">14.</span>
        <div class="legal-clause-content">
          <h4>Indemnification</h4>
          <p>Users and End-Users agree to indemnify and hold Trendify, its affiliates, officers, directors, employees, and agents harmless from claims, damages, or costs arising from misuse of the Platform, violation of these T&Cs, or infringement of third-party rights. Trendify may assume defense of indemnifiable claims, and You agree to cooperate.</p>
          <h4>Intellectual Property Rights Policy</h4>
          <ul class="legal-list">
            <li>All Platform content (e.g., headers, images, trademarks) is owned by Trendify or its partners and protected by copyright laws.</li>
            <li>Users and End-Users may not duplicate, distribute, or exploit Platform content without permission.</li>
            <li>Your intellectual property remains Yours, but You grant Trendify a perpetual, royalty-free, non-exclusive license to use it for Service provision.</li>
            <li>You must ensure End-Users grant You similar licenses for their Content, which You then sublicense to Trendify.</li>
            <li>Upon request, Trendify may provide Your Content copy, subject to reasonable expenses.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">15.</span>
        <div class="legal-clause-content"></div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">16.</span>
        <div class="legal-clause-content">
          <h4>Waiver</h4>
          <p>Trendify's failure to enforce any T&C provision does not waive its right to enforce it later. Any waiver of a breach does not waive future breaches.</p>
          <h4>Limitation of Liability</h4>
          <ul class="legal-list">
            <li>Trendify does not guarantee continuous or error-free Platform availability and is not liable for downtime due to maintenance, security issues, or events beyond Our control.</li>
            <li>Trendify is not liable for direct, indirect, punitive, or consequential damages arising from Service use, interruptions, or unauthorized access.</li>
            <li>Liability for breaches of essential obligations is limited to foreseeable damages, up to the total Service Fee collected.</li>
            <li>Trendify is not liable for data loss due to internet failures, cyberattacks, or viruses, except in cases of product liability or physical injury.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">17.</span>
        <div class="legal-clause-content">
          <h4>Disclaimer</h4>
          <ul class="legal-list">
            <li>Users are responsible for researching Services and ensuring Content complies with Applicable Law.</li>
            <li>Trendify is not liable for Your Content or unlawful activities conducted through the Platform.</li>
            <li>Platform materials may contain errors, and Trendify does not warrant their accuracy or completeness.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">18.</span>
        <div class="legal-clause-content">
          <h4>Confidentiality</h4>
          <ul class="legal-list">
            <li>Parties shall not disclose Confidential Information without written consent, using it only for agreed purposes.</li>
            <li>Reasonable measures must be taken to protect Confidential Information, and misuse must be reported.</li>
            <li>Trendify is not liable for disclosures due to Your negligence in safe computing.</li>
            <li>Confidentiality obligations survive for 12 months post-termination.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">19.</span>
        <div class="legal-clause-content">
          <h4>Reservations of Changes</h4>
          <ul class="legal-list">
            <li>Trendify may update T&Cs without notice. Continued use constitutes acceptance.</li>
            <li>Trendify may modify Services to comply with Applicable Law, address security issues, or benefit Users, with reasonable efforts to inform You of adverse changes.</li>
            <li>You must install updates to receive Account support.</li>
            <li>Service Fees/Platform Fees may change, with communication to Users.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">20.</span>
        <div class="legal-clause-content">
          <h4>Termination</h4>
          <ul class="legal-list">
            <li>Either Party may terminate these T&Cs, effective upon closing all transactions and, for Users, Account deletion.</li>
            <li>Termination ends Your rights to use Services, and You must destroy downloaded materials.</li>
            <li>Pre-termination obligations remain unaffected.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">21.</span>
        <div class="legal-clause-content">
          <h4>Final Provisions</h4>
          <ul class="legal-list">
            <li>Users may not assign T&Cs without Trendify's consent. Trendify may assign T&Cs to affiliates or third parties without notice.</li>
            <li>No partnership, agency, or joint venture is created between Trendify and Users.</li>
            <li>Trendify may use Your name/logo for marketing per good business practices.</li>
            <li>In conflicts with other agreements, these T&Cs prevail.</li>
            <li>Invalid provisions will be replaced to maintain legal and commercial effect, with remaining provisions unaffected.</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">22.</span>
        <div class="legal-clause-content"></div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">23.</span>
        <div class="legal-clause-content">
          <h4>Governing Law and Jurisdiction</h4>
          <p>These T&Cs are governed by Indian law. Disputes shall be subject to the exclusive jurisdiction of courts in Odisha, India.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">24.</span>
        <div class="legal-clause-content">
          <h4>Force Majeure</h4>
          <p>Trendify is not liable for delays or failures due to events beyond Our control, including natural disasters, strikes, or cyberattacks.</p>
          <h4>Grievance Redressal Mechanism</h4>
          <p>For grievances, contact the Grievance Officer:</p>
          <ul class="legal-contact">
            <li>Email: Trendifytechnologies@gmail.com</li>
            <li>Address: Koliatha,Basudevpur,Mahanga,Cuttack.</li>
          </ul>
          <p>Per the Consumer Protection Act, 2019, and E-Commerce Rules, 2020, contact the Nodal Officer:</p>
          <ul class="legal-contact">
            <li>Name: Soumya Barddhan Panda</li>
            <li>Designation: FOUNDER & CEO</li>
            <li>Email: Trendifytechnologies@gmail.com</li>
          </ul>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">25.</span>
        <div class="legal-clause-content">
          <p>Complaints will be acknowledged within 48 hours and resolved within 30 days.</p>
        </div>
      </div>

      <div class="legal-clause">
        <span class="legal-clause-num">26.</span>
        <div class="legal-clause-content">
          <h4>Contact Information</h4>
          <p>For questions about these T&Cs, contact Us at Trendifytechnologies@gmail.com.</p>
        </div>
      </div>
    </div>
  </div>
</div>
'''
}

# Write initial versions
for filename, html in pages.items():
    if filename == 'terms.html':
        path = Path(filename)
        text = path.read_text(encoding='utf-8')
        body_start = text.index('<div class="legal-body">', text.index('<body>'))
        footer_start = text.rindex('<footer>')
        new_text = text[:body_start] + html + text[footer_start:]
        path.write_text(new_text, encoding='utf-8')
        print(f'Updated {filename}')
    elif filename == 'refunds.html':
        path = Path(filename)
        text = path.read_text(encoding='utf-8')
        body_start = text.index('<div class="legal-body">', text.index('<body>'))
        footer_start = text.rindex('<footer>')
        new_text = text[:body_start] + html + text[footer_start:]
        path.write_text(new_text, encoding='utf-8')
        print(f'Updated {filename}')
