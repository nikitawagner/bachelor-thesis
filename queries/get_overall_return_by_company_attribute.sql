CREATE OR REPLACE FUNCTION public.get_overall_return_by_company_attribute(_attribute text, _exclude_tickers text[] DEFAULT '{}'::text[], _included_strategies text[] DEFAULT '{}'::text[])
 RETURNS TABLE(analysis_type analysis_type, closing_strategy_id integer, closing_strategy_name text, attribute_value text, overall_return numeric, overall_percentage numeric, best_stock text, best_stock_return numeric, worst_stock text, worst_stock_return numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF _attribute = 'volatility' THEN
        RETURN QUERY
        WITH ticker_perf AS (
          SELECT 
            a.analysis_type,
            cs.id AS closing_strategy_id,
            cs.name AS closing_strategy_name,  -- this is character varying(255)
            comp.volatility::text AS attribute_value,
            comp.ticker,
            SUM(p.value * (a.percentage/100.0)) AS overall_return,
            SUM(p.value) AS total_value,
            CASE 
              WHEN SUM(p.value)=0 THEN 0 
              ELSE (SUM(p.value * (a.percentage/100.0)) / SUM(p.value)) * 100 
            END AS overall_percentage
          FROM analysis a
          JOIN actions act ON a.fk_action = act.id
          JOIN prices p ON act.fk_price = p.id
          JOIN closing_strategy cs ON a.fk_closing_strategy = cs.id
          JOIN companies comp ON p.fk_company = comp.ticker
          WHERE NOT (p.fk_company = ANY(_exclude_tickers))
            AND cs.name = ANY(_included_strategies)
          GROUP BY a.analysis_type, cs.id, cs.name, comp.volatility, comp.ticker
        ),
        group_perf AS (
          SELECT 
            tp.analysis_type,
            tp.closing_strategy_id,
            tp.closing_strategy_name,  -- still character varying(255)
            tp.attribute_value,
            SUM(tp.overall_return) AS overall_return,
            SUM(tp.total_value) AS total_value,
            CASE 
              WHEN SUM(tp.total_value)=0 THEN 0 
              ELSE (SUM(tp.overall_return) / SUM(tp.total_value)) * 100 
            END AS overall_percentage
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
        ),
        best_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.overall_percentage DESC, tp.ticker ASC
            ) AS rn_best
          FROM ticker_perf tp
        ),
        worst_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.overall_percentage ASC, tp.ticker ASC
            ) AS rn_worst
          FROM ticker_perf tp
        )
        SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,  -- CAST HERE
          gp.attribute_value,
          gp.overall_return,
          gp.overall_percentage,
          br.ticker AS best_stock,
          br.overall_percentage AS best_stock_return,
          wr.ticker AS worst_stock,
          wr.overall_percentage AS worst_stock_return
        FROM group_perf gp
        LEFT JOIN best_ranks br 
          ON gp.analysis_type = br.analysis_type
          AND gp.closing_strategy_id = br.closing_strategy_id
          AND gp.attribute_value = br.attribute_value
          AND br.rn_best = 1
        LEFT JOIN worst_ranks wr 
          ON gp.analysis_type = wr.analysis_type
          AND gp.closing_strategy_id = wr.closing_strategy_id
          AND gp.attribute_value = wr.attribute_value
          AND wr.rn_worst = 1;
          
    ELSIF _attribute = 'size' THEN
        -- Similar query but using comp.size
        RETURN QUERY
        WITH ticker_perf AS (
          SELECT 
            a.analysis_type,
            cs.id AS closing_strategy_id,
            cs.name AS closing_strategy_name,
            comp.size::text AS attribute_value,
            comp.ticker,
            SUM(p.value * (a.percentage/100.0)) AS overall_return,
            SUM(p.value) AS total_value,
            CASE 
              WHEN SUM(p.value)=0 THEN 0 
              ELSE (SUM(p.value * (a.percentage/100.0)) / SUM(p.value)) * 100 
            END AS overall_percentage
          FROM analysis a
          JOIN actions act ON a.fk_action = act.id
          JOIN prices p ON act.fk_price = p.id
          JOIN closing_strategy cs ON a.fk_closing_strategy = cs.id
          JOIN companies comp ON p.fk_company = comp.ticker
          WHERE NOT (p.fk_company = ANY(_exclude_tickers))
            AND cs.name = ANY(_included_strategies)
          GROUP BY a.analysis_type, cs.id, cs.name, comp.size, comp.ticker
        ),
        group_perf AS (
          SELECT 
            tp.analysis_type,
            tp.closing_strategy_id,
            tp.closing_strategy_name,
            tp.attribute_value,
            SUM(tp.overall_return) AS overall_return,
            SUM(tp.total_value) AS total_value,
            CASE 
              WHEN SUM(tp.total_value)=0 THEN 0 
              ELSE (SUM(tp.overall_return) / SUM(tp.total_value)) * 100 
            END AS overall_percentage
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
        ),
        best_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.overall_percentage DESC, tp.ticker ASC
            ) AS rn_best
          FROM ticker_perf tp
        ),
        worst_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.overall_percentage ASC, tp.ticker ASC
            ) AS rn_worst
          FROM ticker_perf tp
        )
        SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          gp.overall_return,
          gp.overall_percentage,
          br.ticker AS best_stock,
          br.overall_percentage AS best_stock_return,
          wr.ticker AS worst_stock,
          wr.overall_percentage AS worst_stock_return
        FROM group_perf gp
        LEFT JOIN best_ranks br 
          ON gp.analysis_type = br.analysis_type
          AND gp.closing_strategy_id = br.closing_strategy_id
          AND gp.attribute_value = br.attribute_value
          AND br.rn_best = 1
        LEFT JOIN worst_ranks wr 
          ON gp.analysis_type = wr.analysis_type
          AND gp.closing_strategy_id = wr.closing_strategy_id
          AND gp.attribute_value = wr.attribute_value
          AND wr.rn_worst = 1;
          
    ELSIF _attribute = 'sector' THEN
        -- Similar query but using comp.sector
        RETURN QUERY
        WITH ticker_perf AS (
          SELECT 
            a.analysis_type,
            cs.id AS closing_strategy_id,
            cs.name AS closing_strategy_name,
            comp.sector::text AS attribute_value,
            comp.ticker,
            SUM(p.value * (a.percentage/100.0)) AS overall_return,
            SUM(p.value) AS total_value,
            CASE 
              WHEN SUM(p.value)=0 THEN 0 
              ELSE (SUM(p.value * (a.percentage/100.0)) / SUM(p.value)) * 100 
            END AS overall_percentage
          FROM analysis a
          JOIN actions act ON a.fk_action = act.id
          JOIN prices p ON act.fk_price = p.id
          JOIN closing_strategy cs ON a.fk_closing_strategy = cs.id
          JOIN companies comp ON p.fk_company = comp.ticker
          WHERE NOT (p.fk_company = ANY(_exclude_tickers))
            AND cs.name = ANY(_included_strategies)
          GROUP BY a.analysis_type, cs.id, cs.name, comp.sector, comp.ticker
        ),
        group_perf AS (
          SELECT 
            tp.analysis_type,
            tp.closing_strategy_id,
            tp.closing_strategy_name,
            tp.attribute_value,
            SUM(tp.overall_return) AS overall_return,
            SUM(tp.total_value) AS total_value,
            CASE 
              WHEN SUM(tp.total_value)=0 THEN 0 
              ELSE (SUM(tp.overall_return) / SUM(tp.total_value)) * 100 
            END AS overall_percentage
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
        ),
        best_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.overall_percentage DESC, tp.ticker ASC
            ) AS rn_best
          FROM ticker_perf tp
        ),
        worst_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.overall_percentage ASC, tp.ticker ASC
            ) AS rn_worst
          FROM ticker_perf tp
        )
        SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          gp.overall_return,
          gp.overall_percentage,
          br.ticker AS best_stock,
          br.overall_percentage AS best_stock_return,
          wr.ticker AS worst_stock,
          wr.overall_percentage AS worst_stock_return
        FROM group_perf gp
        LEFT JOIN best_ranks br 
          ON gp.analysis_type = br.analysis_type
          AND gp.closing_strategy_id = br.closing_strategy_id
          AND gp.attribute_value = br.attribute_value
          AND br.rn_best = 1
        LEFT JOIN worst_ranks wr 
          ON gp.analysis_type = wr.analysis_type
          AND gp.closing_strategy_id = wr.closing_strategy_id
          AND gp.attribute_value = wr.attribute_value
          AND wr.rn_worst = 1;
          
    ELSE
        RAISE EXCEPTION 'Unknown attribute: %', _attribute;
    END IF;
END;
$function$
