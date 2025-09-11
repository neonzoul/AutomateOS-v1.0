# Webhook endpoint for handle webhooks logic.

from fastapi import APIRouter, status

from app.core.queue import q

router = APIRouter()

@router.post(
    "/{workflow_id}",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger a workflow asynchronously",
    description="Queue a background job to execute the workflow identified by workflow_id.",
)

# --- Recieves Webhook request Endpoint --- 
async def trigger_workflow(workflow_id: int):
    """
    [[[ This endpoint receives a webhook request, queues a job for background
     processing, and return immediatly. ]]]
    """
    
    q.enqueue("app.engine.tasks.process_workflow", workflow_id) # type: ignore
    #[[ To ignore Pylance type error because rq uses dynamic strings for function paths. ]]

    return {"message": "Workflow execution has been queued."}

    """ [[[
    - This is the only job of the API: add a task to the queue.
    - 'process_workflow' is the name of the function the worker will run.
    - args=(workflow_id,) are the arguments passes to that function.
    ]]] """