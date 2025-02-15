SELECT 
    analysis.analysis_type,
    closing_strategy.name,
    companies.sector,
    COUNT(CASE WHEN result = 'WIN' THEN 1 END) AS win_count,
    COUNT(CASE WHEN result = 'LOSS' THEN 1 END) AS loss_count,
    COUNT(CASE WHEN result = 'WIN' THEN 1 END) * 1.0 / 
    (COUNT(CASE WHEN result = 'WIN' THEN 1 END) + COUNT(CASE WHEN result = 'LOSS' THEN 1 END)) AS accuracy
FROM 
    public.analysis
JOIN closing_strategy ON analysis.fk_closing_strategy = closing_strategy.id
JOIN actions ON actions.id = analysis.fk_action
JOIN prices ON prices.id = actions.fk_price
JOIN companies ON companies.ticker = prices.fk_company
WHERE closing_strategy.id = 5 OR closing_strategy.id = 6
GROUP BY 
    analysis.analysis_type, closing_strategy.name, sector
ORDER BY 
    analysis.analysis_type, closing_strategy.name;