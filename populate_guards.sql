DO $$
DECLARE
    sept_start_date DATE;
    oct_end_date DATE;
    loop_date DATE;  -- Renombrado (era 'current_date')
    num_guards INT;
    staff_id INT;
    location_id INT;
BEGIN
    sept_start_date := '2025-09-01';
    oct_end_date := '2025-10-31';
    loop_date := sept_start_date;

    -- Loop through each day from September 1st to October 31st
    WHILE loop_date <= oct_end_date LOOP
        -- Generate a random number of guards for the day (e.g., between 2 and 5)
        num_guards := floor(random() * 4) + 2;

        FOR i IN 1..num_guards LOOP
            -- Get random staff and location (1..50)
            staff_id := floor(random() * 50) + 1;
            location_id := floor(random() * 50) + 1;

            -- Insert into GuardDuty table
            INSERT INTO "GuardDuty" ("assignedDate", "assignedStaffId", "locationId", "rolId", "createdAt")
            VALUES (loop_date, staff_id, location_id, 3, NOW());       END LOOP;

        loop_date := loop_date + INTERVAL '1 day'; -- Forma correcta de sumar un día
    END LOOP;
END $$;