-- Allow anyone to insert enriched data (for scraping)
CREATE POLICY "Allow inserts to doctors"
ON doctors FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow inserts to procedure_pricing"
ON procedure_pricing FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow inserts to testimonials"
ON testimonials FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow inserts to facility_packages"
ON facility_packages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow inserts to success_metrics"
ON success_metrics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow inserts to ai_extracted_data"
ON ai_extracted_data FOR INSERT
WITH CHECK (true);
